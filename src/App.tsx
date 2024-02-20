import { useCallback, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';
import { machine } from './machine/machine';
import { type Digit, type MachineEvents } from './machine/type';
import { MachineEventTypes } from './machine/events';
import { type ValueOf } from './types';
import { ArithmeticOperatorMap, COMMANDS, CommandsMap, DIGITS, OPERATORS } from "./common";
import { getKeyboardInputHandler } from './helpers';
// import { type EventData, type SingleOrArray, type Event as EventXstate } from "xstate";
import './App.css'

type AppProps = {
  fastForwardEvents?: MachineEvents[],
};

// Script for event log generation
// const id = Math.ceil(Math.random() * 10000);
// const eventLog = [];
// window.eventLog = eventLog;
// copy(eventLog.join('\n'));

/*
const send = (event: EventXstate<MachineEvents> | SingleOrArray<EventXstate<MachineEvents>>, payload?: EventData | undefined) => {
  const stateName = typeof state.value === "string" ? state.value : Object.entries(state.value).reduce((acc, [k, v]) => `${k}.${v}`, '');
  const log = `${id},${stateName},${(new Date()).toISOString().slice(0, -1).replace("T", " ")},${event.type}`;
  console.log(log);
  eventLog.push(log);
  sendToMachine(event,  payload);
}
*/

const { inspect } = createBrowserInspector();
export function App({ fastForwardEvents }: AppProps) {
  const [state, send] = useMachine(machine, { inspect });

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
    }: ValueOf<typeof ArithmeticOperatorMap>
  ) => <button
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
      disabled={!state.can({ type: eventType })}
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
              ? ` ${ArithmeticOperatorMap[state.context.operator!].displaySign} `
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
