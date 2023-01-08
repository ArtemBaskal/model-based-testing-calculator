import type { GuardFunc, DigitClickedEvent, OperatorClickedEvent, MachineContext } from "./type";
import type { EventObject } from "xstate";
import { ArithmeticOperator } from "./type";

export const everyGuard =
  <T extends EventObject>(guards: GuardFunc<T>[]) =>
    (...args: Parameters<GuardFunc<T>>) =>
      guards.every(guard => guard(...args));

export const isCurrentOperandZero = (context: MachineContext, { data }: DigitClickedEvent) => data === 0;

export const isTheMinusOperator = (context: MachineContext, { data }: OperatorClickedEvent) => data === ArithmeticOperator.MINUS;

export const isOperand2Zero = ({ operand2 }: MachineContext) => parseFloat(operand2!) === 0;

export const isTheDivideOperator = ({ operator }: MachineContext) => operator === ArithmeticOperator.DIVIDE;

export const isDivideByZero = everyGuard([isTheDivideOperator, isOperand2Zero])

export const guards = {
  isCurrentOperandZero,
  isOperand2Zero,
  isTheMinusOperator,
  isDivideByZero,
}