import { type MachineEvents } from "../../machine/type";

export const fastForwardToOperand1One: MachineEvents[] = [
  {
    "type": "DIGIT_CLICKED",
    "data": 1
  }
];

export const fastForwardToOperatorDivide: MachineEvents[] = [
  ...fastForwardToOperand1One,
  {
    "type": "OPERATOR_CLICKED",
    "data": "DIVIDE"
  },
];
export const fastForwardToOperand2Zero: MachineEvents[] = [
  ...fastForwardToOperatorDivide,
  {
    "type": "DIGIT_CLICKED",
    "data": 0
  },
];
export const fastForwardZeroDivision: MachineEvents[] = [
  ...fastForwardToOperand2Zero,
  {
    "type": "EQUAL_SIGN_CLICKED"
  }
];

export const fastForwardToErrorExit: MachineEvents[] = [
  ...fastForwardZeroDivision,
  {
    "type": "OK_BUTTON_CLICKED"
  }
];

export const fastForwardToReset: MachineEvents[] = [
  ...fastForwardToErrorExit,
  {
    "type": "RESET_CLICKED"
  }
];

export const fastForwardToResult: MachineEvents[] = [
  {
    "type": "OPERATOR_CLICKED",
    "data": "MINUS"
  },
  {
    "type": "DIGIT_CLICKED",
    "data": 1
  },
  {
    "type": "DECIMAL_POINT_CLICKED"
  },
  {
    "type": "DIGIT_CLICKED",
    "data": 5
  },
  {
    "type": "OPERATOR_CLICKED",
    "data": "MINUS"
  },
  {
    "type": "OPERATOR_CLICKED",
    "data": "MINUS"
  },
  {
    "type": "DIGIT_CLICKED",
    "data": 0
  },
  {
    "type": "DECIMAL_POINT_CLICKED"
  },
  {
    "type": "DIGIT_CLICKED",
    "data": 7
  },
  {
    "type": "DIGIT_CLICKED",
    "data": 2
  },
  {
    "type": "DIGIT_CLICKED",
    "data": 3
  },
  {
    "type": "EQUAL_SIGN_CLICKED"
  }
];
