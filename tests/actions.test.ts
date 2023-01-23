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

test.describe.parallel('PBT', () => {
  test('should always sum correctly', () => {
    fc.assert(fc.property(fc.float({ noNaN: true }), fc.float({ noNaN: true }), (operand1, operand2) => Number(assignOperand1Calculated({
      operand1: String(operand1),
      operand2: String(operand2),
      operator: ArithmeticOperator.PLUS
    })) === operand1 + operand2), {
      numRuns: 100,
      verbose: true,
    })
  });
});
