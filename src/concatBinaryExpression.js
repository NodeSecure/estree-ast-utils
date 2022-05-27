// Import Internal Dependencies
import { arrayExpressionToString } from "./arrayExpressionToString.js";
import { VariableTracer } from "./utils/VariableTracer.js";

/**
 * @param {*} node
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @returns {IterableIterator<string>}
 */
export function* concatBinaryExpression(node, options = {}) {
  const { tracer = null } = options;

  for (const childNode of [node.left, node.right]) {
    switch (childNode.type) {
      case "BinaryExpression": {
        yield* concatBinaryExpression(childNode, { tracer });
        break;
      }
      case "ArrayExpression": {
        yield* arrayExpressionToString(childNode, { tracer });
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
