// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpressionToString.js";

// CONSTANTS
const kBinaryExprTypes = new Set([
  "Literal",
  "BinaryExpression",
  "Identifier"
]);

export function concatBinaryExpression(node, identifiers = new Set()) {
  const { left, right } = node;
  if (!kBinaryExprTypes.has(left.type) || !kBinaryExprTypes.has(right.type)) {
    return null;
  }
  let str = "";

  for (const childNode of [left, right]) {
    switch (childNode.type) {
      case "BinaryExpression": {
        const value = concatBinaryExpression(childNode, identifiers);
        if (value !== null) {
          str += value;
        }
        break;
      }
      case "ArrayExpression": {
        str += arrayExpressionToString(childNode.elements, identifiers);
        break;
      }
      case "Literal":
        str += childNode.value;
        break;
      case "Identifier":
        if (identifiers.has(childNode.name)) {
          str += identifiers.get(childNode.name);
        }
        break;
    }
  }

  return str;
}
