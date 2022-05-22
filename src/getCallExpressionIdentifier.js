/**
 * @param {any} node
 * @returns {string | null}
 */
export function getCallExpressionIdentifier(node) {
  if (node.type !== "CallExpression") {
    return null;
  }

  return node.callee.type === "Identifier" ? node.callee.name : getCallExpressionIdentifier(node.callee);
}
