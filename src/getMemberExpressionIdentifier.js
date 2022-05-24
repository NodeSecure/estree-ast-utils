// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

// Import Internal Dependencies
import { concatBinaryExpression } from "./concatBinaryExpression.js";

/**
 * Return the complete identifier of a MemberExpression
 *
 * @param {any} node
 * @returns {IterableIterator<string>}
 */
export function* getMemberExpressionIdentifier(node) {
  switch (node.object.type) {
    // Chain with another MemberExpression
    case "MemberExpression":
      yield* getMemberExpressionIdentifier(node.object);
      break;
    case "Identifier":
      yield node.object.name;
      break;
    // Literal is used when the property is computed
    case "Literal":
      yield node.object.value;
      break;
  }

  switch (node.property.type) {
    case "Identifier":
      yield node.property.name;
      break;
    // Literal is used when the property is computed
    case "Literal":
      yield node.property.value;
      break;

    // foo.bar[callexpr()]
    case "CallExpression": {
      const args = node.property.arguments;
      if (args.length > 0 && args[0].type === "Literal" && Hex.isHex(args[0].value)) {
        yield Buffer.from(args[0].value, "hex").toString();
      }
      break;
    }

    // foo.bar["k" + "e" + "y"]
    case "BinaryExpression": {
      const literal = [...concatBinaryExpression(node.property)].join("");
      if (literal.trim() !== "") {
        yield literal;
      }
      break;
    }
  }
}
