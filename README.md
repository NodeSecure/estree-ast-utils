# estree-ast-utils

![version](https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/npm-registry-sdk/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/NodeSecure/npm-registry-sdk/commit-activity)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/NodeSecure/npm-registry-sdk/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/NodeSecure/npm-registry-sdk)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg?style=for-the-badge)](https://github.com/NodeSecure/npm-registry-sdk/blob/master/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/npm-registry-sdk/node.js.yml?style=for-the-badge)

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

const tracer = new VariableTracer().enableDefaultTracing();

const data = tracer.getDataFromIdentifier("identifier...here");
console.log(data);
```

## API

<details><summary>arrayExpressionToString(node): IterableIterator< string ></summary>

Translate an ESTree ArrayExpression into an iterable of Literal value.

```js
["foo", "bar"];
```

will return `"foo"` then `"bar"`.

</details>

<details><summary>concatBinaryExpression(node, options): IterableIterator< string ></summary>

Return all Literal part of a given Binary Expression.

```js
"foo" + "bar";
```

will return `"foo"` then `"bar"`.

One of the options of the method is `stopOnUnsupportedNode`, if true it will throw an Error if the left or right side of the Expr is not a supported type.

</details>

<details><summary>getCallExpressionIdentifier(node): string | null</summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foobar();
```

will return `"foobar"`.

</details>

<details><summary>getMemberExpressionIdentifier(node): IterableIterator< string ></summary>

Return the identifier name of the CallExpression (or null if there is none).

```js
foo.bar();
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

<details><summary>isLiteralRegex(node): boolean</summary>

Return `true` if the given Node is a Literal Regex Node.

```js
/^hello/g;
```

</details>

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/estree-ast-utils/commits?author=fraxken" title="Code">💻</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/NodeSecure/estree-ast-utils/commits?author=fraxken" title="Tests">⚠️</a> <a href="https://github.com/NodeSecure/estree-ast-utils/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="#maintenance-fabnguess" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
