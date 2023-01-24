import { MachineEventTypes } from './machine/events';

export const ArithmeticOperator = {
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
} as const;

export const ArithmeticOperatorMap = {
  [ArithmeticOperator.PLUS]: {
    operator: ArithmeticOperator.PLUS,
    displaySign: '+'
  },
  [ArithmeticOperator.MINUS]: {
    operator: ArithmeticOperator.MINUS,
    displaySign: '−'
  },
  [ArithmeticOperator.MULTIPLY]: {
    operator: ArithmeticOperator.MULTIPLY,
    displaySign: '×'
  },
  [ArithmeticOperator.DIVIDE]: {
    operator: ArithmeticOperator.DIVIDE,
    displaySign: '÷'
  },
};

export const Commands = {
  EQUAL: 'EQUAL',
  DECIMAL_POINT: 'DECIMAL_POINT',
  PERCENT: 'PERCENT',
  CLEAR: 'CLEAR',
  RESET: 'RESET',
  OK: 'OK',
  PARENTHESES: 'PARENTHESES',
} as const;

export const CommandsMap = {
  [Commands.EQUAL]: {
    'data-test': Commands.EQUAL,
    eventType: MachineEventTypes.EQUAL_SIGN_CLICKED,
    displaySign: '='
  },
  [Commands.DECIMAL_POINT]: {
    'data-test': Commands.DECIMAL_POINT,
    eventType: MachineEventTypes.DECIMAL_POINT_CLICKED,
    displaySign: '.'
  },
  [Commands.PERCENT]: {
    'data-test': Commands.PERCENT,
    eventType: MachineEventTypes.PERCENT_SIGN_CLICKED,
    displaySign: '%'
  },
  [Commands.CLEAR]: {
    'data-test': Commands.CLEAR,
    eventType: MachineEventTypes.CLEAR_BUTTON_CLICKED,
    displaySign: 'CE'
  },
  [Commands.RESET]: {
    'data-test': Commands.RESET,
    eventType: MachineEventTypes.RESET_CLICKED,
    displaySign: 'C'
  },
  [Commands.OK]: {
    'data-test': Commands.OK,
    eventType: MachineEventTypes.OK_BUTTON_CLICKED,
    displaySign: 'OK'
  },
  [Commands.PARENTHESES]: {
    'data-test': Commands.PARENTHESES,
    eventType: MachineEventTypes.PARENTHESES_CLICKED,
    displaySign: '( )'
  },
};

export const DIGITS = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0] as const;
export const OPERATORS = [ArithmeticOperatorMap.DIVIDE, ArithmeticOperatorMap.MULTIPLY, ArithmeticOperatorMap.MINUS, ArithmeticOperatorMap.PLUS] as const;
export const COMMANDS = [CommandsMap.PARENTHESES, CommandsMap.PERCENT, CommandsMap.RESET, CommandsMap.CLEAR] as const;
