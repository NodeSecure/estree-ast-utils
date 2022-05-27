
// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { createTracer } from "./utils.js";

test("getDataFromIdentifier must return primitive null is there is no kwown traced identifier", (tape) => {
  const helpers = createTracer(true);

  const result = helpers.tracer.getDataFromIdentifier("foobar");

  tape.strictEqual(result, null);
  tape.end();
});

test("it should be able to Trace a malicious code with Global, BinaryExpr, Assignments and Hexadecimal", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    var foo;
    const g = eval("this");
    const p = g["pro" + "cess"];

    const evil = p["mainMod" + "ule"][unhex("72657175697265")];
    const work = evil(unhex("2e2f746573742f64617461"))
  `);

  const evil = helpers.tracer.getDataFromIdentifier("evil");
  tape.deepEqual(evil, {
    name: "require",
    identifierOrMemberExpr: "process.mainModule.require",
    assignmentMemory: ["p", "evil"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "process");
  tape.strictEqual(eventOne.id, "p");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "process.mainModule.require");
  tape.strictEqual(eventTwo.id, "evil");

  tape.end();
});

test("it should be able to Trace require re-assignment (using a global variable)", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const test = globalThis;
    const foo = test.require;
    foo("http");
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  tape.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require",
    assignmentMemory: ["foo"]
  });
  tape.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "require");
  tape.strictEqual(eventOne.id, "foo");

  tape.end();
});

test("it should be able to Trace require re-assignment (using a MemberExpression)", (tape) => {
  const helpers = createTracer(true);
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const foo = require.resolve;
    foo("http");
  `);

  const foo = helpers.tracer.getDataFromIdentifier("foo");
  tape.deepEqual(foo, {
    name: "require",
    identifierOrMemberExpr: "require.resolve",
    assignmentMemory: ["foo"]
  });
  tape.strictEqual(assignments.length, 1);

  const [eventOne] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "require.resolve");
  tape.strictEqual(eventOne.id, "foo");

  tape.end();
});

test("it should be able to Trace crypto.createHash when imported with an ESM ImportNamespaceSpecifier", (tape) => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", { followConsecutiveAssignment: true });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    import fs from "fs";
    import * as cryptoBis from "crypto";

    const createHashBis = cryptoBis.createHash;
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["cryptoBis", "createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto");
  tape.strictEqual(eventOne.id, "cryptoBis");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});

test("it should be able to Trace crypto.createHash when imported with an ESM ImportSpecifier", (tape) => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", { followConsecutiveAssignment: true });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    import { createHash } from "crypto";

    const createHashBis = createHash;
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHash", "createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventOne.id, "createHash");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});

test("it should be able to Trace crypto.createHash with CJS require and Literal computed method", (tape) => {
  const helpers = createTracer();
  helpers.tracer.trace("crypto.createHash", { followConsecutiveAssignment: true });
  const assignments = helpers.getAssignmentArray();

  helpers.walkOnCode(`
    const fs = require("fs");
    const crypto = require("crypto");

    const id = "createHash";
    const createHashBis = crypto[id];
    createHashBis("md5");
  `);

  const createHashBis = helpers.tracer.getDataFromIdentifier("createHashBis");

  tape.deepEqual(createHashBis, {
    name: "crypto.createHash",
    identifierOrMemberExpr: "crypto.createHash",
    assignmentMemory: ["createHashBis"]
  });
  tape.strictEqual(assignments.length, 2);

  const [eventOne, eventTwo] = assignments;
  tape.strictEqual(eventOne.identifierOrMemberExpr, "crypto");
  tape.strictEqual(eventOne.id, "crypto");

  tape.strictEqual(eventTwo.identifierOrMemberExpr, "crypto.createHash");
  tape.strictEqual(eventTwo.id, "createHashBis");

  tape.end();
});
