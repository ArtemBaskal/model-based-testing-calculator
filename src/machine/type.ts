import type { ValueOf } from '../types';
import type { ConditionPredicate, EventObject } from 'xstate';
import { MachineEventTypes } from './events';

interface MachineContextCache {
}

interface MachineContextStatePartial {
  operand1?: string,
  operand2?: string,
  operator?: ArithmeticOperator,
}

interface MachineContextStateRequired {
  operand1: string,
  operand2: string,
  operator: ArithmeticOperator,
}

interface MachineContextStateNever {
  operand1: never,
  operand2: never,
  operator: never,
}

export interface MachineContext extends Partial<Readonly<MachineContextCache>>, MachineContextStatePartial {
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

export type GuardFunc<Event extends EventObject = MachineEvents> = ConditionPredicate<MachineContext, Event>;

type Modify<T, R extends { [P in keyof T]?: any }> = Omit<T, keyof R> & R;

type Zero = '0';

export type TypeState =
  {
    value: { Cluster: 'Start' }
      | 'NegativeNumber1',
    context: MachineContextStateNever,
  } |
  {
    value: 'Operand1Entered'
      | { Operand1Entered: 'AfterDecimalPoint' }
      | { Operand1Entered: 'BeforeDecimalPoint' }
      | { Cluster: 'Result' },
    context: Modify<MachineContextStateNever, Pick<MachineContextStateRequired, 'operand1'>>,
  } |
  {
    value: { Operand1Entered: 'Zero' },
    context: Modify<MachineContextStateNever, { 'operand1': Zero }>
  } |
  {
    value: 'OperatorEntered' | 'NegativeNumber2',
    context: Modify<MachineContextStateNever, Pick<MachineContextStateRequired, 'operand1' | 'operator'>>,
  } |
  {
    value: 'Operand2Entered'
      | { Operand2Entered: 'AfterDecimalPoint' }
      | { Operand2Entered: 'BeforeDecimalPoint' }
    context: MachineContextStateRequired,
  } |
  {
    value: { Operand2Entered: 'Zero' },
    context: Modify<MachineContextStateRequired, { operand2: Zero }>,
  } |
  {
    value: 'AlertError',
    context: Modify<MachineContextStateRequired, { 'operator': Extract<ArithmeticOperator, 'DIVIDE'>, 'operand2': Zero }>,
  } |
  {
    value: 'Cluster',
    context: Modify<MachineContextStateNever, Pick<MachineContextStatePartial, 'operand1'>>,
  }

