// Import Third-party Dependencies
import test from "tape";
import { IteratorMatcher } from "iterator-matcher";

// Import Internal Dependencies
import { getMemberExpressionIdentifier } from "../index.js";
import { codeToAst, getExpressionFromStatement } from "./utils.js";

test("it must return all literals part of the given MemberExpression", (tape) => {
  const [astNode] = codeToAst("foo.bar.xd");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);
  tape.end();
});

test("it must return computed properties of the given MemberExpression", (tape) => {
  const [astNode] = codeToAst("foo['bar']['xd']");
  const iter = getMemberExpressionIdentifier(
    getExpressionFromStatement(astNode)
  );

  const iterResult = new IteratorMatcher()
    .expect("foo")
    .expect("bar")
    .expect("xd")
    .execute(iter, { allowNoMatchingValues: false });

  tape.strictEqual(iterResult.isMatching, true);
  tape.strictEqual(iterResult.elapsedSteps, 3);

  tape.end();
});
