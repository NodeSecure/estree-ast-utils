# estree-ast-utils
Utilities for AST (ESTree compliant)

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/estree-ast-utils
# or
$ yarn add @nodesecure/estree-ast-utils
```

## Usage example

```js
import { VariableTracer } from "@nodesecure/estree-ast-utils";

const tracer = new VariableTracer()
  .enableDefaultTracing();

const data = tracer.getDataFromIdentifier("identifier...here");
console.log(data);
```

## API

<details><summary>arrayExpressionToString(node): IterableIterator< string ></summary>

Translate an ESTree ArrayExpression into an iterable of Literal value.

```js
["foo", "bar"]
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>concatBinaryExpression(node): IterableIterator< string ></summary>

Return all Literal part of a given Binary Expression.

```js
"foo" + "bar"
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>getCallExpressionIdentifier(node): string | null</summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foobar()
```

will return `"foobar"`.

</details>

<details><summary>getMemberExpressionIdentifier(node): IterableIterator< string ></summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foo.bar()
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>getVariableDeclarationIdentifiers(node): IterableIterator< string ></summary>

Get all variables identifier name.

```js
const [foo, bar] = [1, 2];
```

will return `"foo"` then `"bar"`.

</details>

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License
MIT
