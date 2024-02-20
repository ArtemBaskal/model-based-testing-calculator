import { useCallback, useEffect } from 'react';
import { useActor } from '@xstate/react';
import { type Digit, type MachineEvents } from './machine/type';
import { MachineEventTypes } from './machine/events';
import { type ValueOf } from './types';
import { ArithmeticOperatorMap, COMMANDS, CommandsMap, DIGITS, OPERATORS } from "./common";
import { getKeyboardInputHandler } from './helpers';
import { type Actor } from "xstate";
import { type AnyActorLogic } from "xstate/dist/declarations/src/types";
import './App.css'

type AppProps = {
  fastForwardEvents?: MachineEvents[],
  service: Actor<AnyActorLogic>,
};

//  TODO: extract
export function AppActor({ fastForwardEvents, service }: AppProps) {
  const [state, send] = useActor(service);

  useEffect(() => {
    const keyboardInputHandler = getKeyboardInputHandler(send);
    document.addEventListener('keydown', keyboardInputHandler);
    return () => {
      document.removeEventListener('keydown', keyboardInputHandler);
    }
  }, [])

  useEffect(() => {
    if (fastForwardEvents) {
      fastForwardEvents.forEach((event) => {
        send(event);
      });
    }
  }, [fastForwardEvents])

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

  const renderOperator = useCallback((
    {
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
        {renderCommand(CommandsMap.OK)}
          <div data-test="error-zero-division" className="error-message">Error: Division by Zero</div>
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
