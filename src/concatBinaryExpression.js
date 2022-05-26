// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpressionToString.js";
import { VariableTracer } from "./utils/VariableTracer.js";

// CONSTANTS
const kBinaryExprTypes = new Set([
  "Literal",
  "BinaryExpression",
  "Identifier"
]);

/**
 * @param {*} node
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @returns {IterableIterator<string>}
 */
export function* concatBinaryExpression(node, options = {}) {
  const { tracer = null } = options;
  const { left, right } = node;

  if (!kBinaryExprTypes.has(left.type) || !kBinaryExprTypes.has(right.type)) {
    return;
  }

  for (const childNode of [left, right]) {
    switch (childNode.type) {
      case "BinaryExpression": {
        yield* concatBinaryExpression(childNode, { tracer });
        break;
      }
      case "ArrayExpression": {
        yield* arrayExpressionToString(childNode.elements, { tracer });
        break;
      }
      case "Literal":
        yield childNode.value;
        break;
      case "Identifier":
        if (tracer !== null && tracer.literalIdentifiers.has(childNode.name)) {
          yield tracer.literalIdentifiers.get(childNode.name);
        }
        break;
    }
  }
}
