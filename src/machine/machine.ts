import { createMachine } from "xstate";
import type { MachineContext, MachineEvents } from "./type";
import { assignOperator, assignOperand1, assignOperand2, assignOperand2DecimalPoint } from "./assignActions";
import { actions } from "./actions";
import { INITIAL_CONTEXT } from "./type";
import { guards } from "./guards";

// TODO: typegen
// TODO: add keyboard click events listeners
// TODO: vue
// TODO: property based tests for actions
export const machine = createMachine(
  {
    predictableActionArguments: true,
    context: INITIAL_CONTEXT,
    initial: "Cluster",
    id: "Calc",
    schema: {
      context: <MachineContext>{},
      events: <MachineEvents>{},
    },
    states: {
      Cluster: {
        initial: "Start",
        states: {
          Start: {
            entry: ['assignResetContext'],
            on: {
              OPERATOR_CLICKED: {
                description: "-",
                cond: 'isTheMinusOperator',
                target: "#Calc.NegativeNumber1",
              },
            },
          },
          Result: {
            on: {
              OPERATOR_CLICKED: {
                description: "+ - * /",
                actions: ['assignOperator'],
                target: "#Calc.OperatorEntered",
              },
              PERCENT_SIGN_CLICKED: {
                description: "%",
                actions: ['assignOperand1DividedBy100'],
              },
            },
          },
        },
        on: {
          DIGIT_CLICKED: [
            {
              description: "0",
              cond: 'isCurrentOperandZero',
              actions: ['assignOperand1'],
              target: "Operand1Entered.Zero",
            },
            {
              description: "1-9",
              actions: ['assignOperand1'],
              target: "Operand1Entered.BeforeDecimalPoint",
            }
          ],
          DECIMAL_POINT_CLICKED: {
            description: ".",
            actions: ['assignOperand1Zero', 'assignOperand1DecimalPoint'],
            target: "Operand1Entered.AfterDecimalPoint",
          },
        },
      },
      NegativeNumber1: {
        on: {
          DIGIT_CLICKED: {
            description: "0-9",
            actions: ['assignOperand1Negative'],
            target: "Operand1Entered.BeforeDecimalPoint",
          },
          DECIMAL_POINT_CLICKED: {
            description: ".",
            actions: ['assignOperand1Zero', 'assignOperand1DecimalPoint'],
            target: "Operand1Entered.AfterDecimalPoint",
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
            actions: ['assignResetOperand1'],
            target: "Cluster",
          },
        },
      },
      Operand1Entered: {
        states: {
          Zero: {
            on: {
              DIGIT_CLICKED: [
                {
                  // FIXME
                  description: "0",
                  cond: 'isCurrentOperandZero',
                },
                {
                  description: "1-9",
                  actions: ['assignOperand1'],
                  target: "BeforeDecimalPoint",
                }
              ],
              DECIMAL_POINT_CLICKED: {
                description: ".",
                actions: ['assignOperand1DecimalPoint'],
                target: "AfterDecimalPoint",
              },
            },
          },
          BeforeDecimalPoint: {
            on: {
              DIGIT_CLICKED: {
                actions: ['assignAddDigitToOperand1'],
                description: "0-9",
              },
              DECIMAL_POINT_CLICKED: {
                description: ".",
                actions: ['assignOperand1DecimalPoint'],
                target: "AfterDecimalPoint",
              },
            },
          },
          AfterDecimalPoint: {
            exit: ['assignOperand1ParsedFloat'],
            on: {
              DIGIT_CLICKED: {
                description: "0-9",
                actions: ['assignAddDigitToOperand1'],
              },
            },
          },
        },
        on: {
          OPERATOR_CLICKED: {
            description: "+ - * /",
            actions: ['assignOperator'],
            target: "OperatorEntered",
          },
          PERCENT_SIGN_CLICKED: {
            description: "%",
            actions: ['assignOperand1DividedBy100'],
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
            actions: ['assignResetOperand1'],
            target: "Cluster",
          },
        },
      },
      OperatorEntered: {
        on: {
          DIGIT_CLICKED: [
            {
              description: "0",
              cond: 'isCurrentOperandZero',
              actions: ['assignOperand2'],
              target: "Operand2Entered.Zero",
            },
            {
              actions: ['assignOperand2'],
              description: "1-9",
              target: "Operand2Entered.BeforeDecimalPoint",
            }
          ],
          DECIMAL_POINT_CLICKED: {
            description: ".",
            actions: ['assignOperand2Zero', 'assignOperand2DecimalPoint'],
            target: "Operand2Entered.AfterDecimalPoint",
          },
          OPERATOR_CLICKED: [
            {
              description: "-",
              cond: 'isTheMinusOperator',
              target: "NegativeNumber2",
            },
            {
              description: "+ * /",
              actions: ['assignOperator'],
              target: "OperatorEntered",
            }
          ],
        },
      },
      NegativeNumber2: {
        on: {
          DIGIT_CLICKED: [
            {
              description: "0",
              cond: 'isCurrentOperandZero',
              actions: ['assignOperand2'],
              target: "Operand2Entered.Zero",
            },
            {
              actions: ['assignOperand2Negative'],
              description: "1-9",
              target: "Operand2Entered.BeforeDecimalPoint",
            }
          ],
          DECIMAL_POINT_CLICKED: {
            description: ".",
            actions: ['assignOperand2Zero', 'assignOperand2DecimalPoint'],
            target: "Operand2Entered.AfterDecimalPoint",
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
            actions: ['assignResetOperand2'],
            target: "OperatorEntered",
          },
        },
      },
      Operand2Entered: {
        // FIXME: debug
        // type: 'history',
        // history: 'shallow',
        // initial: 'BeforeDecimalPoint',
        states: {
          Zero: {
            on: {
              DIGIT_CLICKED: [
                {
                  // FIXME
                  description: "0",
                  cond: 'isCurrentOperandZero',
                },
                {
                  description: "1-9",
                  actions: ['assignOperand2'],
                  target: "BeforeDecimalPoint",
                }
              ],
              DECIMAL_POINT_CLICKED: {
                description: ".",
                actions: ['assignOperand2DecimalPoint'],
                target: "AfterDecimalPoint",
              },
            },
          },
          BeforeDecimalPoint: {
            on: {
              DIGIT_CLICKED: {
                actions: ['assignAddDigitToOperand2'],
                description: "0-9",
              },
              DECIMAL_POINT_CLICKED: {
                description: ".",
                actions: ['assignOperand2DecimalPoint'],
                target: "AfterDecimalPoint",
              },
            },
          },
          AfterDecimalPoint: {
            exit: ['assignOperand2ParsedFloat'],
            on: {
              DIGIT_CLICKED: {
                description: "0-9",
                actions: ['assignAddDigitToOperand2'],
              },
            },
          },
        },
        on: {
          EQUAL_SIGN_CLICKED: [
            {
              cond: "isDivideByZero",
              target: "AlertError",
            },
            {
              description: "=",
              actions: ['assignOperand1Calculated', 'assignResetOperand2', 'assignResetOperator'],
              target: "Cluster.Result",
            },
          ],
          OPERATOR_CLICKED: {
            description: "+ * /",
            actions: ['assignOperator'],
            target: "OperatorEntered",
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
            actions: ['assignResetOperand2'],
            target: "OperatorEntered",
          },
        },
      },
      // TODO: modal
      AlertError: {
        on: {
          OK_BUTTON_CLICKED: {
            description: "OK",
            actions: ['assignResetOperand2'],
            target: "Operand2Entered",
          },
        },
      },
    },
    on: {
      RESET_CLICKED: {
        description: "C",
        actions: ['assignResetOperand1', 'assignResetOperand2', 'assignResetOperator'],
        target: "Cluster",
      },
    },
  },
  {
    guards,
    actions,
  }
);
