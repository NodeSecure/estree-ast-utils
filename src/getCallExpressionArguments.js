// Import Third-party Dependencies
import { Hex } from "@nodesecure/sec-literal";

export function getCallExpressionArguments(node) {
  if (node.type !== "CallExpression" || node.arguments.length === 0) {
    return null;
  }

  const literalsNode = node.arguments
    .filter((arg) => arg.type === "Literal")
    .map((arg) => hexToString(arg.value));

  return literalsNode.length === 0 ? null : literalsNode;
}

function hexToString(value) {
  return Hex.isHex(value) ? Buffer.from(value, "hex").toString() : value;
}
