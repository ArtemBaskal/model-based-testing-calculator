// import { assign as immerAssign } from "@xstate/immer";
import { assign } from "xstate";
import type { MachineContext, OperatorClickedEvent, DigitClickedEvent } from "./type";
import { INITIAL_CONTEXT, ArithmeticOperator } from "./type";

export const assignOperand1 = assign<MachineContext, DigitClickedEvent>({
  operand1: (context, { data }) => `${data}`,
});

export const assignOperand2 = assign<MachineContext, DigitClickedEvent>({
  operand2: (context, { data }) => `${data}`,
});

export const assignOperator = assign<MachineContext, OperatorClickedEvent>({
  operator: (context, { data }) => data,
});

export const assignOperand1DividedBy100 = assign<MachineContext, OperatorClickedEvent>({
  operand1: ({ operand1 }) => `${parseFloat(operand1!) / 100}`,
});

export const assignResetOperator = assign<MachineContext, OperatorClickedEvent>({
  operator: INITIAL_CONTEXT.operator,
});

export const assignOperand1Calculated = assign<MachineContext, OperatorClickedEvent>({
  operand1: ({ operand1, operand2, operator }) => {
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
  },
});

export const assignResetOperand1 = assign<MachineContext, DigitClickedEvent>({
  operand1: INITIAL_CONTEXT.operand1,
});

export const assignResetOperand2 = assign<MachineContext, DigitClickedEvent>({
  operand2: INITIAL_CONTEXT.operand2,
});

export const assignAddDigitToOperand1 = assign<MachineContext, DigitClickedEvent>({
  operand1: ({ operand1 }, { data }) => `${operand1!}${data}`,
});

// FIXME: consider 0
export const assignAddDecimalPointDigitToOperand1 = assign<MachineContext, DigitClickedEvent>({
  operand1: ({ operand1 }, { data }) => `${operand1!}.${data}`,
});

export const assignOperand1DecimalPoint = assign<MachineContext>({
  operand1: ({ operand1 }) => `${operand1!}.`,
});

export const assignAddDigitToOperand2 = assign<MachineContext, DigitClickedEvent>({
  operand2: ({ operand2 }, { data }) => `${operand2!}${data}`,
});

export const assignOperand2DecimalPoint = assign<MachineContext>({
  operand2: ({ operand2 }) => `${operand2!}.`,
});

export const assignAddDecimalPointDigitToOperand2 = assign<MachineContext, DigitClickedEvent>({
  // FIXME: consider 0
  operand2: ({ operand2 }, { data }) => `${operand2!}.${data}`,
});

export const assignOperand1Negative = assign<MachineContext, DigitClickedEvent>({
  operand1: (context, { data }) => `-${data}`,
});

export const assignOperand2Negative = assign<MachineContext, DigitClickedEvent>({
  operand2: (context, { data }) => `-${data}`,
});

export const assignOperand1Zero = assign<MachineContext>({
  operand1: '0',
});

export const assignOperand2Zero = assign<MachineContext>({
  operand2: '0',
});

export const assignOperand1ParsedFloat = assign<MachineContext>({
  operand1: ({ operand1 }) => `${parseFloat(operand1!)}`,
});

export const assignOperand2ParsedFloat = assign<MachineContext>({
  operand2: ({ operand2 }) => `${parseFloat(operand2!)}`,
});

export const assignResetContext = assign<MachineContext>(() => INITIAL_CONTEXT);

export const assignActions = {
  assignOperand1,
  assignOperand2,
  assignOperator,
  assignOperand1Calculated,
  assignOperand1DividedBy100,
  assignResetOperator,
  assignResetOperand1,
  assignResetOperand2,
  assignAddDigitToOperand1,
  assignAddDigitToOperand2,
  assignOperand1Negative,
  assignOperand2Negative,
  assignAddDecimalPointDigitToOperand1,
  assignAddDecimalPointDigitToOperand2,
  assignOperand1Zero,
  assignOperand2Zero,
  assignOperand1DecimalPoint,
  assignOperand2DecimalPoint,
  assignOperand1ParsedFloat,
  assignOperand2ParsedFloat,
  assignResetContext,
}
