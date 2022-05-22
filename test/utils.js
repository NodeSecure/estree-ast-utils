// Import Third-party Dependencies
import * as meriyah from "meriyah";

export function codeToAst(code) {
  const estreeRootNode = meriyah.parseScript(code, {
    next: true,
    loc: true,
    raw: true,
    module: true,
    globalReturn: false
  });

  return estreeRootNode.body;
}

export function getExpressionFromStatement(node) {
  return node.type === "ExpressionStatement" ? node.expression : null;
}
