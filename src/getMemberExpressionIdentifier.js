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

    // TODO: BinaryExpression + CallExpression
  }
}
