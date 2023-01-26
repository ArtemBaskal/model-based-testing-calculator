import { test } from "@playwright/test";
import * as fc from "fast-check";
import { type ValueOf } from "../src/types";

const ArithmeticOperator = {
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
} as const;

type ArithmeticOperator = ValueOf<typeof ArithmeticOperator>;
const assignOperand1Calculated = ({ operand1, operand2, operator }: { operand1: string, operand2: string, operator: ArithmeticOperator }) => {
  const o1 = parseFloat(operand1!);
  const o2 = parseFloat(operand2!);

  switch (operator!) {
    case ArithmeticOperator.PLUS: {
      return `${o1 + o2}`;
    }
    case ArithmeticOperator.MINUS: {
      return `${o1 - o2}`;
    }
    case ArithmeticOperator.MULTIPLY: {
      return `${o1 * o2}`;
    }
    case ArithmeticOperator.DIVIDE: {
      return `${o1 / o2}`;
    }
  }
};

const exampleContext = () => fc.sample(fc.context(), { numRuns: 1 })[0];

test.describe.parallel('PBT', () => {
  test('should always sum correctly', () => {
    fc.assert(
      fc.property(
        fc.float(
          {
            noNaN: true,
            noDefaultInfinity: true,
          }),
        fc.float({
          noNaN: true,
          noDefaultInfinity: true,
        }),
        fc.context(),
        (operand1, operand2, ctx) => {
          ctx.log(`operand1: ${operand1}`);
          ctx.log(`operand2: ${operand2}`);
          ctx.log(`operator: ${ArithmeticOperator.PLUS}`);

          return Number(
            assignOperand1Calculated({
              operand1: String(operand1),
              operand2: String(operand2),
              operator: ArithmeticOperator.PLUS
            })) === operand1 + operand2;
        }), {
        numRuns: 100,
        verbose: true,
        examples: [[2, 2, exampleContext()]],
        // seed: 1150536523,
        // path: "0:0:1:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0",
        // endOnFailure: true,
      })
  });
});
