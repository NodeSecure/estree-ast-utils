// Import Node.js Dependencies
import { EventEmitter } from "events";

// Import Internal Dependencies
import { notNullOrUndefined } from "./notNullOrUndefined.js";
import { getMemberExpressionIdentifier } from "../getMemberExpressionIdentifier.js";
import { getCallExpressionIdentifier } from "../getCallExpressionIdentifier.js";

// CONSTANTS
const kGlobalIdentifiersToTrace = new Set([
  "global", "globalThis", "root", "GLOBAL", "window"
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
    return this
      .trace("require", { followConsecutiveAssignment: true })
      .trace("eval")
      .trace("Function")
      .trace("process.mainModule")
      .trace("require.resolve", { followConsecutiveAssignment: true });
  }

  /**
   *
   * @param {!string} identifierOrMemberExpr
   * @param {*} options
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
      const parts = identifierOrMemberExpr.split(".");
      parts.pop();

      parts
        .filter((expr) => !this.#traced.has(expr))
        .forEach((expr) => this.trace(expr, { followConsecutiveAssignment: true, name }));
    }

    return this;
  }

  // getIdentifierTrace(identifier) {
  //   const tracedIdentifier = this.#traced.Identifier.get(identifier);
  //   const originTracedIdentifier = this.#traced.Identifier.get(tracedIdentifier.name);

  //   return originTracedIdentifier.assignmentMemory.join(".");
  // }

  #declareNewAssignment(identifierOrMemberExpr, variableDeclaratorNode) {
    const tracedVariant = this.#traced.get(identifierOrMemberExpr);
    const newIdentiferName = variableDeclaratorNode.id.name;

    const assignmentEventPayload = {
      name: tracedVariant.name,
      identifierOrMemberExpr: tracedVariant.identifierOrMemberExpr,
      id: newIdentiferName,
      location: variableDeclaratorNode.id.loc
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

  walk(node) {
    if (node.type !== "VariableDeclaration") {
      return;
    }

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

          break;
        }

        // const r = require
        case "Identifier": {
          const identifierName = init.name;
          if (this.#traced.has(identifierName)) {
            this.#declareNewAssignment(identifierName, variableDeclaratorNode);
          }
          else if (this.#isGlobalVariableIdentifier(identifierName)) {
            this.#variablesRefToGlobal.add(id.name);
          }

          break;
        }

        // process.mainModule and require.resolve
        case "MemberExpression": {
          // Example: ["process", "mainModule"]
          const memberExprParts = [...getMemberExpressionIdentifier(init)];
          const memberExprFullname = memberExprParts.join(".");

          if (this.#traced.has(memberExprFullname)) {
            this.#declareNewAssignment(memberExprFullname, variableDeclaratorNode);
          }
          else {
            const alternativeMemberExprParts = this.#reverseMemberExprParts(memberExprParts);
            const alternativeMemberExprFullname = alternativeMemberExprParts.join(".");
            console.log(alternativeMemberExprFullname);

            if (this.#traced.has(alternativeMemberExprFullname)) {
              this.#declareNewAssignment(alternativeMemberExprFullname, variableDeclaratorNode);
            }
          }

          break;
        }
      }
    }
  }
}
