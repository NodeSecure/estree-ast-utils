
export function arrayExpressionToString(elements, identifiers = null) {
  let ret = "";
  const isArrayExpr = typeof elements === "object" && Reflect.has(elements, "elements");
  const localElements = isArrayExpr ? elements.elements : elements;

  for (const row of localElements) {
    if (row.type === "Literal") {
      if (row.value === "") {
        continue;
      }

      const value = Number(row.value);
      ret += Number.isNaN(value) ? row.value : String.fromCharCode(value);
    }
    else if (row.type === "Identifier" && identifiers !== null && identifiers.has(row.name)) {
      ret += identifiers.get(row.name);
    }
  }

  return ret;
}
