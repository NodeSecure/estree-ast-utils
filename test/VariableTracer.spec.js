
// Import Third-party Dependencies
import test from "tape";
import { walk } from "estree-walker";

// Import Internal Dependencies
import { VariableTracer } from "../index.js";
import { codeToAst } from "./utils.js";

test("it should trace require identifier", (tape) => {
  const tracer = new VariableTracer()
    .trace("crypto.createHash", { followConsecutiveAssignment: true });
  tracer.on(VariableTracer.AssignmentEvent, (value) => console.log(value));

  const astNode = codeToAst(`
  const boo = require("crypto");

  const b = boo.createHash;
  b("md5");
  `);
  // const astNode = codeToAst(`
  // function unhex(r) {
  //     return Buffer.from(r, "hex").toString();
  // }

  // const g = eval("this");
  // const p = g["pro" + "cess"];

  // const evil = p["mainMod" + "ule"][unhex("72657175697265")];
  // const work = evil(unhex("2e2f746573742f64617461"))
  // `);

  walk(astNode, {
    enter(node) {
      tracer.walk(node);
    }
  });

  tracer.debug();

  tape.end();
});
