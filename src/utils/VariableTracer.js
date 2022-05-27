// Import Node.js Dependencies
import { EventEmitter } from "events";

// Import Internal Dependencies
import { notNullOrUndefined } from "./notNullOrUndefined.js";
import { getSubMemberExpressionSegments } from "./getSubMemberExpressionSegments.js";
import { getMemberExpressionIdentifier } from "../getMemberExpressionIdentifier.js";
import { getCallExpressionIdentifier } from "../getCallExpressionIdentifier.js";

// CONSTANTS
const kGlobalIdentifiersToTrace = new Set([
  "global", "globalThis", "root", "GLOBAL", "window"
]);
const kRequirePatterns = new Set([
  "require", "require.resolve", "process.mainModule.require"
]);
const kUnsafeGlobalCallExpression = new Set(["eval", "Function"]);

export class VariableTracer extends EventEmitter {
  static AssignmentEvent = Symbol("AssignmentEvent");

  // PUBLIC PROPERTIES
  /** @type {Map<string, string>} */
  literalIdentifiers = new Map();

  // PRIVATE PROPERTIES
  #traced = new Map();
  #variablesRefToGlobal = new Set();

  debug() {
    console.log(this.#traced);
  }

  enableDefaultTracing() {
    [...kRequirePatterns]
      .forEach((pattern) => this.trace(pattern, { followConsecutiveAssignment: true, name: "require" }));

    return this
      .trace("eval")
      .trace("Function");
  }

  /**
   *
   * @param {!string} identifierOrMemberExpr
   * @param {object} [options]
   * @param {string} [options.name]
   * @param {boolean} [options.followConsecutiveAssignment=false]
   *
   * @example
   * new VariableTracer()
   *  .trace("require", { followConsecutiveAssignment: true })
   *  .trace("process.mainModule")
   */
  trace(identifierOrMemberExpr, options = {}) {
    const {
      followConsecutiveAssignment = false,
      name = identifierOrMemberExpr
    } = options;

    this.#traced.set(identifierOrMemberExpr, {
      name,
      identifierOrMemberExpr,
      followConsecutiveAssignment,
      assignmentMemory: []
    });
    if (identifierOrMemberExpr.includes(".")) {
      [...getSubMemberExpressionSegments(identifierOrMemberExpr)]
        .filter((expr) => !this.#traced.has(expr))
        .forEach((expr) => this.trace(expr, { followConsecutiveAssignment: true, name }));
    }

    return this;
  }

  getDataFromIdentifier(identifierOrMemberExpr) {
    if (!this.#traced.has(identifierOrMemberExpr)) {
      return null;
    }

    const tracedIdentifier = this.#traced.get(identifierOrMemberExpr);
    const assignmentMemory = this.#traced.get(tracedIdentifier.name)?.assignmentMemory ?? [];

    return {
      name: tracedIdentifier.name,
      identifierOrMemberExpr: tracedIdentifier.identifierOrMemberExpr,
      assignmentMemory
    };
  }

  #declareNewAssignment(identifierOrMemberExpr, id) {
    const tracedVariant = this.#traced.get(identifierOrMemberExpr);
    const newIdentiferName = id.name;

    const assignmentEventPayload = {
      name: tracedVariant.name,
      identifierOrMemberExpr: tracedVariant.identifierOrMemberExpr,
      id: newIdentiferName,
      location: id.loc
    };
    this.emit(VariableTracer.AssignmentEvent, assignmentEventPayload);
    this.emit(tracedVariant.identifierOrMemberExpr, assignmentEventPayload);

    if (tracedVariant.followConsecutiveAssignment && !this.#traced.has(newIdentiferName)) {
      this.#traced.get(tracedVariant.name).assignmentMemory.push(newIdentiferName);
      this.#traced.set(newIdentiferName, tracedVariant);
    }
  }

  #isGlobalVariableIdentifier(identifierName) {
    return kGlobalIdentifiersToTrace.has(identifierName) ||
      this.#variablesRefToGlobal.has(identifierName);
  }

  #reverseMemberExprParts(parts = []) {
    return parts.flatMap((identifierName) => {
      if (this.#traced.has(identifierName)) {
        return this.#traced.get(identifierName).identifierOrMemberExpr;
      }
      if (this.#isGlobalVariableIdentifier(identifierName)) {
        return [];
      }

      return identifierName;
    });
  }

  #walkImportDeclaration(node) {
    const moduleName = node.source.value;
    if (!this.#traced.has(moduleName)) {
      return;
    }

    // import * as boo from "crypto";
    if (node.specifiers[0].type === "ImportNamespaceSpecifier") {
      const importNamespaceNode = node.specifiers[0];
      this.#declareNewAssignment(moduleName, importNamespaceNode.local);

      return;
    }

    // import { createHash } from "crypto";
    const importSpecifiers = node.specifiers
      .filter((specifierNode) => specifierNode.type === "ImportSpecifier");
    for (const specifier of importSpecifiers) {
      const fullImportedName = `${moduleName}.${specifier.imported.name}`;

      if (this.#traced.has(fullImportedName)) {
        this.#declareNewAssignment(fullImportedName, specifier.imported);
      }
    }
  }

  #walkVariableDeclarator(node) {
    for (const variableDeclaratorNode of node.declarations) {
      const { init, id } = variableDeclaratorNode;

      // var foo; <-- no initialization here.
      if (!notNullOrUndefined(init) || id.type !== "Identifier") {
        continue;
      }

      switch (init.type) {
        // let foo = "10"; <-- "foo" is the key and "10" the value
        case "Literal":
          this.literalIdentifiers.set(id.name, init.value);
          break;

        // const g = eval("this");
        case "CallExpression": {
          const identifierName = getCallExpressionIdentifier(init);
          if (kUnsafeGlobalCallExpression.has(identifierName)) {
            this.#variablesRefToGlobal.add(id.name);
          }
          // const { createHash } = require("crypto");
          // const foo = require("crypto");
          else if (kRequirePatterns.has(identifierName)) {
            const moduleNameLiteral = init.arguments
              .find((argumentNode) => argumentNode.type === "Literal" && this.#traced.has(argumentNode.value));
            if (!moduleNameLiteral) {
              break;
            }

            if (id.type === "Identifier") {
              this.#declareNewAssignment(moduleNameLiteral.value, id);
            }
          }

          break;
        }

        // const r = require
        case "Identifier": {
          const identifierName = init.name;
          if (this.#traced.has(identifierName)) {
            this.#declareNewAssignment(identifierName, variableDeclaratorNode.id);
          }
          else if (this.#isGlobalVariableIdentifier(identifierName)) {
            this.#variablesRefToGlobal.add(id.name);
          }

          break;
        }

        // process.mainModule and require.resolve
        case "MemberExpression": {
          // Example: ["process", "mainModule"]
          const memberExprParts = [...getMemberExpressionIdentifier(init, { tracer: this })];
          const memberExprFullname = memberExprParts.join(".");

          if (this.#traced.has(memberExprFullname)) {
            this.#declareNewAssignment(memberExprFullname, variableDeclaratorNode.id);
          }
          else {
            const alternativeMemberExprParts = this.#reverseMemberExprParts(memberExprParts);
            const alternativeMemberExprFullname = alternativeMemberExprParts.join(".");

            if (this.#traced.has(alternativeMemberExprFullname)) {
              this.#declareNewAssignment(alternativeMemberExprFullname, variableDeclaratorNode.id);
            }
          }

          break;
        }
      }
    }
  }

  walk(node) {
    switch (node.type) {
      case "ImportDeclaration": {
        this.#walkImportDeclaration(node);
        break;
      }
      case "VariableDeclaration":
        this.#walkVariableDeclarator(node);
        break;
    }
  }
}
