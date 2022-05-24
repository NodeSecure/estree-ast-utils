// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpressionToString.js";

// CONSTANTS
const kBinaryExprTypes = new Set([
  "Literal",
  "BinaryExpression",
  "Identifier"
]);

export function* concatBinaryExpression(node, identifiers = new Set()) {
  const { left, right } = node;
  if (!kBinaryExprTypes.has(left.type) || !kBinaryExprTypes.has(right.type)) {
    return;
  }

  for (const childNode of [left, right]) {
    switch (childNode.type) {
      case "BinaryExpression": {
        yield* concatBinaryExpression(childNode, identifiers);
        break;
      }
      case "ArrayExpression": {
        yield arrayExpressionToString(childNode.elements, identifiers);
        break;
      }
      case "Literal":
        yield childNode.value;
        break;
      case "Identifier":
        if (identifiers.has(childNode.name)) {
          yield identifiers.get(childNode.name);
        }
        break;
    }
  }
}
