import { assign, createMachine } from "xstate";
import { assign as immutableAssign } from "@xstate/immer";
import {
  type ClearButtonClickedEvent,
  type DecimalPointClickedEvent,
  type DigitClickedEvent,
  type EqualSignClickedEvent,
  type MachineContext,
  type MachineEvents,
  type OperatorClickedEvent,
  type PercentSignClickedEvent,
  type ResetClickedEvent,
  type TypeState,
  ArithmeticOperator,
  INITIAL_CONTEXT,
} from "./type";
import { everyGuard } from "./guards";

// TODO: add keyboard click events listeners
// TODO: vue
// TODO: property based tests for actions
export const machine = createMachine<MachineContext, MachineEvents, TypeState>(
  {
    predictableActionArguments: true,
    context: INITIAL_CONTEXT,
    initial: "Cluster",
    id: "Calc",
    schema: {
      context: {} as MachineContext,
      events: {} as MachineEvents,
    },
    // tsTypes: {} as import("./machine.typegen").Typegen0,
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
              actions: ['assignOperand1Zero'],
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
              actions: ['assignOperand2Zero'],
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
              actions: ['assignOperand2Negative'],
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
        // FIXME: debug history without initial
        // type: 'history',
        states: {
          Zero: {
            on: {
              DIGIT_CLICKED: [
                {
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
            // actions: ['assignResetOperand2'],
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
    guards: {
      isCurrentOperandZero: (_: MachineContext, { data }: DigitClickedEvent) => data === 0,
      isTheMinusOperator: (_: MachineContext, { data }: OperatorClickedEvent) => data === ArithmeticOperator.MINUS,
      isDivideByZero: everyGuard(
        ({ operator }: MachineContext, _: EqualSignClickedEvent) => operator === ArithmeticOperator.DIVIDE,
        ({ operand2 }: MachineContext, _: EqualSignClickedEvent) => parseFloat(operand2!) === 0,
      ),
    },
    actions: {
      assignAddDigitToOperand1: immutableAssign<MachineContext, DigitClickedEvent>((context, { data }) => {
        context.operand1 = `${context.operand1!}${data}`;
      }),
      assignAddDigitToOperand2: assign<MachineContext, DigitClickedEvent>({
        operand2: ({ operand2 }, { data }) => `${operand2!}${data}`,
      }),
      assignOperand1: assign<MachineContext, DigitClickedEvent>({
        operand1: (_, { data }) => `${data}`,
      }),
      assignOperand1Calculated: assign<MachineContext, EqualSignClickedEvent>({
        operand1: ({ operand1, operand2, operator }) => {
          const o1 = parseFloat(operand1!);
          const o2 = parseFloat(operand2!);

          switch (operator!) {
            case ArithmeticOperator.PLUS: {
              return `${o1 + o2}`;
            }
            case ArithmeticOperator.MINUS: {
              return `${o1 - o2}`;
            }
            case ArithmeticOperator.MULTIPLY: {
              return `${o1 * o2}`;
            }
            case ArithmeticOperator.DIVIDE: {
              return `${o1 / o2}`;
            }
          }
        },
      }),
      assignOperand1DecimalPoint: assign<MachineContext, DecimalPointClickedEvent>({
        operand1: ({ operand1 }) => `${operand1!}.`,
      }),
      assignOperand1DividedBy100: assign<MachineContext, PercentSignClickedEvent>({
        operand1: ({ operand1 }) => `${parseFloat(operand1!) / 100}`,
      }),
      assignOperand1Negative: assign<MachineContext, DigitClickedEvent>({
        operand1: (_, { data }) => `-${data}`,
      }),
      assignOperand1ParsedFloat: assign<MachineContext, OperatorClickedEvent | ClearButtonClickedEvent | ResetClickedEvent | { type: "xstate.stop" }>({
        operand1: ({ operand1 }) => `${parseFloat(operand1!)}`,
      }),
      assignOperand1Zero: assign<MachineContext, DecimalPointClickedEvent>({
        operand1: (_) => '0',
      }),
      assignOperand2: assign<MachineContext, DigitClickedEvent>({
        operand2: (_, { data }) => `${data}`,
      }),
      assignOperand2DecimalPoint: assign<MachineContext, DecimalPointClickedEvent>({
        operand2: ({ operand2 }) => `${operand2!}.`,
      }),
      assignOperand2Negative: assign<MachineContext, DigitClickedEvent>({
        operand2: (_, { data }) => `-${data}`,
      }),
      assignOperand2ParsedFloat: assign({
        operand2: ({ operand2 }) => `${parseFloat(operand2!)}`,
      }),
      assignOperand2Zero: assign<MachineContext, DecimalPointClickedEvent>({
        operand2: (_) => '0',
      }),
      assignOperator: assign<MachineContext, OperatorClickedEvent>({
        operator: (_, { data }) => data,
      }),
      assignResetContext: assign<MachineContext, ClearButtonClickedEvent | EqualSignClickedEvent | ResetClickedEvent | { type: "xstate.init" }>((_) => INITIAL_CONTEXT),
      assignResetOperand1: assign<MachineContext, ClearButtonClickedEvent | ResetClickedEvent>({
        operand1: (_) => INITIAL_CONTEXT.operand1,
      }),
      assignResetOperand2: assign<MachineContext,  ClearButtonClickedEvent | EqualSignClickedEvent | ResetClickedEvent>({
        operand2: (_) => INITIAL_CONTEXT.operand2,
      }),
      assignResetOperator: assign<MachineContext,  EqualSignClickedEvent | ResetClickedEvent>({
        operator: (_) => INITIAL_CONTEXT.operator,
      }),
    },
  }
);
