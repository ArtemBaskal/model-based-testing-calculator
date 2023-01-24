import { MachineEventTypes } from './machine/events';
import { type Digit, type MachineEvents } from './machine/type';
import { ArithmeticOperator } from './common';

export const getKeyboardInputHandler = (send: (event: MachineEvents) => void) => (e: KeyboardEvent) => {
  switch (e.key) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9': {
      send({ type: MachineEventTypes.DIGIT_CLICKED, data: Number(e.key) as Digit });
      return;
    }
    case '+': {
      send({ type: MachineEventTypes.OPERATOR_CLICKED, data: ArithmeticOperator.PLUS });
      return;
    }
    case '-': {
      send({ type: MachineEventTypes.OPERATOR_CLICKED, data: ArithmeticOperator.MINUS });
      return;
    }
    case '*': {
      send({ type: MachineEventTypes.OPERATOR_CLICKED, data: ArithmeticOperator.MULTIPLY });
      return;
    }
    case '/': {
      send({ type: MachineEventTypes.OPERATOR_CLICKED, data: ArithmeticOperator.DIVIDE });
      return;
    }
    case '.': {
      send({ type: MachineEventTypes.DECIMAL_POINT_CLICKED });
      return;
    }
    case '=': {
      send({ type: MachineEventTypes.EQUAL_SIGN_CLICKED });
      return;
    }
    case '%': {
      send({ type: MachineEventTypes.PERCENT_SIGN_CLICKED });
      return;
    }
    case 'Backspace': {
      send({ type: MachineEventTypes.CLEAR_BUTTON_CLICKED });
      return;
    }
    case 'Escape': {
      send({ type: MachineEventTypes.RESET_CLICKED });
      return;
    }
    case 'Enter':
    case ' ': {
      send({ type: MachineEventTypes.OK_BUTTON_CLICKED });
      return;
    }
    default: {
      break;
    }
  }
};

// FIXME: add types
// @ts-ignore
export const matchesSome = (state, patterns) => patterns.some(pattern => state.matches(pattern));