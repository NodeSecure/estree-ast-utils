
/**
 * @param {!string} identifier
 */
export function isEvilIdentifierPath(identifier) {
  return isFunctionPrototype(identifier);
}

/**
 * @param {!string} identifier
 */
function isFunctionPrototype(identifier) {
  return identifier.startsWith("Function.prototype")
    && /call|apply|bind/i.test(identifier);
}
