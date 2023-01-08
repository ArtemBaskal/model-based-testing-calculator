import type { ValueOf } from "../types";
import { MachineEventTypes } from "./events";
import type { ConditionPredicate, EventObject } from "xstate";

interface MachineContextCache {
}

interface MachineContextState {
  operand1?: string,
  operand2?: string,
  operator?: ArithmeticOperator,
}

export interface MachineContext extends Partial<Readonly<MachineContextCache>>, MachineContextState {
}

export type MachineEventTypes = typeof MachineEventTypes;

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type DigitClickedEvent = {
  type: MachineEventTypes['DIGIT_CLICKED'];
  data: Digit;
};

export type PercentSignClickedEvent = {
  type: MachineEventTypes['PERCENT_SIGN_CLICKED'];
};
export const ArithmeticOperator = {
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
} as const;

export type ArithmeticOperator = ValueOf<typeof ArithmeticOperator>;

export type OperatorClickedEvent = {
  type: MachineEventTypes['OPERATOR_CLICKED'];
  data: ArithmeticOperator;
};

export type DecimalPointClickedEvent = {
  type: MachineEventTypes['DECIMAL_POINT_CLICKED'];
  data?: never;
};

export type ClearButtonClickedEvent = {
  type: MachineEventTypes['CLEAR_BUTTON_CLICKED'];
  data?: never;
};

export type EqualSignClickedEvent = {
  type: MachineEventTypes['EQUAL_SIGN_CLICKED'];
  data?: never;
};

export type OkButtonClickedEvent = {
  type: MachineEventTypes['OK_BUTTON_CLICKED'];
  data?: never;
};

export type ResetClickedEvent = {
  type: MachineEventTypes['RESET_CLICKED'];
  data?: never;
};

export type ParenthesesClickedEvent = {
  type: MachineEventTypes['PARENTHESES_CLICKED'];
  data?: never;
};

export type MachineEvents =
  DigitClickedEvent
  | OperatorClickedEvent
  | PercentSignClickedEvent
  | DecimalPointClickedEvent
  | ClearButtonClickedEvent
  | EqualSignClickedEvent
  | OkButtonClickedEvent
  | ResetClickedEvent
  | ParenthesesClickedEvent;

export const INITIAL_CONTEXT: MachineContext = {};

export type GuardFunc<Event extends EventObject = MachineEvents> = ConditionPredicate<MachineContext,
  Event>;
