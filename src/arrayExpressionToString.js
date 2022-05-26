// Import Internal Dependencies
import { VariableTracer } from "./utils/VariableTracer.js";

/**
 * @param {*} elements
 * @param {object} options
 * @param {VariableTracer} [options.tracer=null]
 * @returns {IterableIterator<string>}
 */

export function* arrayExpressionToString(elements, options = {}) {
  const { tracer = null } = options;

  const isArrayExpr = typeof elements === "object" && Reflect.has(elements, "elements");
  const localElements = isArrayExpr ? elements.elements : elements;

  for (const row of localElements) {
    if (row.type === "Literal") {
      if (row.value === "") {
        continue;
      }

      const value = Number(row.value);
      yield Number.isNaN(value) ? row.value : String.fromCharCode(value);
    }
    else if (row.type === "Identifier" && tracer !== null && tracer.literalIdentifiers.has(row.name)) {
      yield tracer.literalIdentifiers.get(row.name);
    }
  }
}
