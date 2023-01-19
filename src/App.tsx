import { useCallback } from "react";
import { useActor, useInterpret } from '@xstate/react';
import { machine } from "./machine/machine";
import { ArithmeticOperator, type Digit } from "./machine/type";
import { MachineEventTypes } from "./machine/events";
import { type ValueOf } from "./types";
import './App.css'

const ArithmeticOperatorMap = {
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

const Commands = {
  EQUAL: 'EQUAL',
  DECIMAL_POINT: 'DECIMAL_POINT',
  PERCENT: 'PERCENT',
  CLEAR: 'CLEAR',
  RESET: 'RESET',
  OK: 'OK',
  PARENTHESES: 'PARENTHESES',
} as const;

const CommandsMap = {
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
}

// FIXME: add types
// @ts-ignore
export const matchesSome = (state, patterns) => patterns.some(pattern => state.matches(pattern));

const DIGITS = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0] as const;
const OPERATORS = [ArithmeticOperatorMap.DIVIDE, ArithmeticOperatorMap.MULTIPLY, ArithmeticOperatorMap.MINUS, ArithmeticOperatorMap.PLUS] as const;
const COMMANDS = [CommandsMap.PARENTHESES, CommandsMap.PERCENT, CommandsMap.RESET, CommandsMap.CLEAR] as const;

export function App() {
  const machineService = useInterpret(machine, { devTools: true });
  const [state, send] = useActor(machineService);

  const renderDigitButton = useCallback((digit: Digit) => <button
    key={digit}
    type="button"
    onClick={() => {
      send({ type: MachineEventTypes.DIGIT_CLICKED, data: digit });
    }}
    data-test={`digit${digit}`}
    disabled={!state.can({
      type: MachineEventTypes.DIGIT_CLICKED,
      data: digit,
    })}
  >
    {digit}
  </button>, [state]);

  const renderOperator = useCallback(({
                                        operator,
                                        displaySign
                                      }: ValueOf<typeof ArithmeticOperatorMap>) => <button
    key={operator}
    type="button"
    onClick={() => {
      send({ type: MachineEventTypes.OPERATOR_CLICKED, data: operator });
    }}
    disabled={!state.can({
      type: MachineEventTypes.OPERATOR_CLICKED, data: operator,
    })}
    data-test={`operator${operator}`}
  >
    {displaySign}
  </button>, [state]);

  const renderCommand = useCallback(({ eventType, displaySign, 'data-test': dataTest }: ValueOf<typeof CommandsMap>) =>
    <button
      key={displaySign}
      type="button"
      onClick={() => {
        send({ type: eventType })
      }}
      disabled={!state.can(eventType)}
      data-test={`command${dataTest}`}
    >
      {displaySign}
    </button>, [state]);

  return (
    <div className="App">
      {state.matches('AlertError') && <div>
          <span data-test="error-zero-division">Ошибка: Деление на ноль</span>
          <br/>
        {renderCommand(CommandsMap.OK)}
      </div>}
      <input
        type="text"
        readOnly
        value={
          `${
            state.matches('NegativeNumber1')
              ? '-'
              : ''
          }${
            state.matches({ Cluster: 'Start' })
            || state.matches('NegativeNumber1')
              ? ''
              : state.context.operand1
          }${
            state.matches('OperatorEntered')
            || state.matches('NegativeNumber2')
            || state.matches('Operand2Entered')
            || state.matches('AlertError')
              ? ` ${ArithmeticOperatorMap[state.context.operator].displaySign} `
              : ''
          }${
            state.matches('NegativeNumber2')
              ? '-'
              : ''
          }${
            state.matches('Operand2Entered')
            || state.matches('AlertError')
              ? state.context.operand2
              : ''
          }`
        }
        className="calc-input"
        data-test="calc-input"
      />
      <div className="container">
        <section className="commands-section">{COMMANDS.map(renderCommand)}</section>
        <section className="digits-section">
          {DIGITS.map(renderDigitButton)}
          {renderCommand(CommandsMap.DECIMAL_POINT)}
          {renderCommand(CommandsMap.EQUAL)}
        </section>
        <section className="operators-section">{OPERATORS.map(renderOperator)}</section>
      </div>
    </div>
  )
}
