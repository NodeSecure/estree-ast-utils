// Import Internal Dependencies
import { notNullOrUndefined } from "./utils/notNullOrUndefined.js";

export function* getVariableDeclarationIdentifiers(node) {
  switch (node.type) {
    case "VariableDeclaration": {
      for (const variableDeclarator of node.declarations) {
        yield* getVariableDeclarationIdentifiers(variableDeclarator.id);
      }

      break;
    }

    case "VariableDeclarator":
      yield* getVariableDeclarationIdentifiers(node.id);

      break;

    case "Identifier":
      yield node.name;

      break;

    /**
     * Rest syntax (in ArrayPattern or ObjectPattern for example)
     * const [...foo] = []
     * const {...foo} = {}
     */
    case "RestElement":
      yield node.argument.name;

      break;

    /**
     * (foo = 5)
     */
    case "AssignmentExpression":
      yield* getVariableDeclarationIdentifiers(node.left);

      break;

    /**
     * const [foo = 10] = []
     *       ↪ Destructuration + Assignement of a default value
     */
    case "AssignmentPattern":
      yield node.left.name;

      break;

    /**
     * const [foo] = [];
     *       ↪ Destructuration of foo is an ArrayPattern
     */
    case "ArrayPattern":
      yield* node.elements
        .filter(notNullOrUndefined)
        .map((id) => [...getVariableDeclarationIdentifiers(id)]).flat();

      break;

    /**
     * const {foo} = {};
     *       ↪ Destructuration of foo is an ObjectPattern
     */
    case "ObjectPattern":
      yield* node.properties
        .filter(notNullOrUndefined)
        .map((property) => [...getVariableDeclarationIdentifiers(property)]).flat();

      break;
  }
}
