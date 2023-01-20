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

// TODO: add storybook with predefined story states
// TODO: add service invocation for result calculation
// TODO: add keyboard click events listeners
// TODO: vue
// TODO: property based tests for actions
export const machine = 
/** @xstate-layout N4IgpgJg5mDOIC5QGECGAbAxgYgEoFEBlfAFQH1kAZASWQGl8ARAbQAYBdRUABwHtYAlgBcBvAHZcQAD0QA2AEwAOAHQB2AJyL16jQEZWrBbIA0IAJ6IAzIt3LNs3btmLWAVlWLL8gCwBfX6ZoWMrI6ACusEJgAE7YjNQA4tTkVLQMLBySfIIi4pIyCE7eyrqq3rry6paqlqzybvKmFghaqiU+hg6supbe3f6BGJgh4ZExcYnJFDT0TMy6nEgg2cKiEksF7q7KrvKuruqysjX1Hk2IWqzKspaH7h46rF4DIEHDoRFRsYz4yNQAsgBBShkAAKAHlqAA5FIzdJsRY8firPIbRC6bzqYqqDTaVyKPo6fbnFo4ko3XQ2VSuRyaVQvN4jT4xZSEISoaJCbDg0H4XCAkjg3DTNJzTJLFa5dagAoYxTyNQaRQHdTuSwKSwk-a2DRKBSsKqWLyuBlDJljaLKXBwMLoLk8vkCoUi2YZRHLZFS-KIAC01QV3i8Nw8qh8+PUJN0OhUupxx1k6nk8g0puCHwtVptduwvNwyHwMLIhESUJd8PFSJya29CGs23ktwN1MO6vUTi1oeUyvcsgOunxT0UqeGULAUFQIgAbmAoWEALYAIxiugmSVhordWU91bRCHkFXUylYigcTgb3jKnkjrluJW0pQxmJPiiHAVeZtH46nM-nS+iK-iNcyzmBYtyrVEZUQeonDsY9HAeXsNG8SNVDcHZ+wcI5KW0dRh2UT8JwEadZ0XZc4l+AFgTBSFC1SV0ETAlFpWkKCDEPVxAxqTFMSNJNI0sfY1AOZxk0TSk3DwgjvxIv8VyofBAWFAAhABVEhBVLOjy3dSUd0gwpZDqI8egqeRDKjalXBJBND17dVvAOboG16PDwW4GJUDECBdHwMQvkgblcydYUtLFHTtwglja0xOxvFkbxPBxQlyhJeoG0VMzVA1HwjFc9zok87zfP8iAcz5fNC2LBJNLhMLGK9XcfSjWQ7CcJ4KlYVQemTExzEQFtriUfZKgcSxSjyjyvJ8vyYgC+TFLIVT1PBGqNwYiUIuYgpLjsdVamqOpvAcqy+padQrhuaNDLbZN5AmgqpuK2aIGUAAtGJeFXKZQs3DbwK2xBvGTZRMXiyp8T1Y9euaCoCTUfVQ0MwxVXuwrppKt6Pq+9d6NAv6mJrBzLHJC8bmORNVUUfiPHh04zIMBMTTfRk3MmoqZuiSBMeiT6fj+IEQQhaEce0+q9Kiky2lxHwMW0E82xQxQ2n0CnqlqDj4tRx6Oa5pSwAAM14TnGDATABDnDBQV4AQ-Ox4DfsrAnd0TYp+3KZMlfO6oI1O0yrlqd3eg8Btdi19mMb1w3jdN83Let22+cowWaJFur8Ya-THDhupXE6noA5caH0T6FrNEqdUNDqXQw-R57lEBfWvhNs2LfQK2ba5QDvtqh2PX+msnBp+UctYBLkxxRpfajK4amHykMWOUfUaEI2ns50qu9T3vdMigozJanFbkMpQ9sMTVTobfQjzisagbM2Hl9XnWN8mLf5nC-vd17WxOs8E9KgJFoE6zQfCoRKNYJwXgCRPHpMzM0rMCor2iGvAKicBbUWFvbdajsM5RU0MUI6E96jyjGr2VKR0VDuH-rdNsWJZCP2Qc-QKjpBQhR7tgvuTtM6UmJloMmhhD7ylSgYHUCYvCjwbLlOBwQEETifiVZh-JWFYLxjg8WspKTYgJKUBwQMlZmWESeEG984pbCeEzQYwQpJER-KRaI8g7Y-Q4TvAGe4KjbBxDUAwQNYYORJGNSkygxrjyVqGRw+xJJjkIsRX8MQHGbxUR-LhUU0o-06koOofCAn+IyTsPYIklBdWqJEr8NiZJxPIvzKiQtaLsIrJw3BsptBXHcb0NwfRXBHB9iAk82wDgT3cA2MoETpEjiidJWJ9jsDzWUmpDSWD6kuIHnsC6tRqTe3innVKRpihHF2MeTxUYHJh3kCg0q+AACKKkqJVVWvRRZm0aw3l2S4GkzhUJHBuP4jith5YOU8Q5TiJyznYEudckEtzEli13r6fE2wxoCSDheJy-jwkg24glbQfQ-CjOULIrypymEOiUc6JxDzP76R9HsZWllqTHiUC4ZCF8HItSwr2BKdQqi9mBUwmZi05krQWUkxpvpsUlEDJ4fQ7tTKpS6i1I63RSj7D4Z4HlGN3o80cXU4V6j0RaBBhUOUCYuo8VSp4YmCY3bnTDBUNVdcNW81flC9OuqEA-JKJ1coSsMTUkcKlHQConiHXsvuXCuL8UQEJeqrGaDqkpyFdC1xNgFSdOVAaASvr9z+KNC1BF1IHDKiBiMyxwwI1RrrpHI2YBm6xzbvHTuTqyU6phQgeKytPmVD2AlHxsqYIKvgsqw4qrw35UKuW9eyhK3RxbnHDulSk4YNqWtclySNEviCWUUhiYDAHCpqdWohgux7JlnGPYlg7UTobk3GOrd24J0bdqxNA8aRXE8AoOKpxSiqFlQ5a4BJexHF4vic9uLAToBiEIfA0QeaxHBHQfly07mixdS2-sSYj0nkDMcG8Ltvn1GUPuZU2Ed2Bn8G+MQvAIBwEkG8J9jUbjEwRc8soqEKj+oISeB8hHuidLwumL4dH9KVDaEaakoZDgOW8SSBK8L9ioT6LcJMki+OjC+KydknJBNRRsLYcot9EbqieFqRMOwRKoTbPFJwKnmSWmtLAW0QgtMFF6PC6ogyJO51HiSUMWjuw300HUO6uLrExLsboJzUE3bXAZu1DiBxgFyF2EefEUYkyBaGjXM5EW3EqAwqqeCFN8SRn0MTBsBIbyiaOhY98MjR3a2jTzbL+8SidPy6UQre6YZVbUAaMeRoxrHky8-SdBsq01tvfW7L8oVA2F6E4G4RHOmRjvjsJCuiEwviVkNjGV6YjjdnX5bLGJ3A9b4fuXO7Xz4w2sAQhQWIv29FAQwrLKHXE3jaFUXOQMjgKYvKleoh5OWqlAXFJ4IGS34XGWUyZ8gjuqmJk4N2jLMRKCZSAhsVxkzeK+x4BK4Oaulrq5Gl7aiW1mS7G2XYpwKtVDR1BBQKgsTdAMFoVnr4IdlrOcoAAEgISIRtmik9cRhBUHsKRYh0F4b9+61ZqGtUDeTNgqgXq5g67LZQKdoep0aWn-qbgEZfMeIMo8PD45ZkT8dutRvTtrXexzr2az-wI1leU+JqRxWVP60oXYWeGEcG4SkKuXq7eiPtutHcju53hZZbQeg+jUi920FwnRdgcUOPQ0D4HORQZg9l3s2wehZSyvUawkj-FdCCedak+4HBdSs2RoAA */
createMachine<MachineContext, MachineEvents, TypeState>(
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
          DIGIT_CLICKED: [
            {
              description: "0",
              cond: 'isCurrentOperandZero',
              actions: ['assignOperand1Negative'],
              target: "Operand1Entered.Zero",
            },
            {
              description: "1-9",
              actions: ['assignOperand1Negative'],
              target: "Operand1Entered.BeforeDecimalPoint",
            },
          ],
          DECIMAL_POINT_CLICKED: {
            description: ".",
            actions: ['assignOperand1NegativeZero', 'assignOperand1DecimalPoint'],
            target: "Operand1Entered.AfterDecimalPoint",
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
            target: "Cluster.Start",
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
            target: 'Cluster.Result',
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
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
            actions: ['assignOperand2NegativeZero', 'assignOperand2DecimalPoint'],
            target: "Operand2Entered.AfterDecimalPoint",
          },
          CLEAR_BUTTON_CLICKED: {
            description: "CE",
            target: "OperatorEntered",
          },
        },
      },

      Operand2Entered: {
        states: {
          History: {
            type: 'history',
          },
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
            actions: ['assignResetOperand2', 'assignOperator'],
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
            target: "Operand2Entered.History",
          }
        },
      }
    },
    on: {
      RESET_CLICKED: {
        description: "C",
        target: "Cluster",
      },
    },
  },
  {
    guards: {
      // @ts-ignore
      isCurrentOperandZero: (_: MachineContext, { data }: DigitClickedEvent) => data === 0,
      // @ts-ignore
      isTheMinusOperator: (_: MachineContext, { data }: OperatorClickedEvent) => data === ArithmeticOperator.MINUS,
      // @ts-ignore
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
      assignOperand1ParsedFloat: assign<MachineContext, OperatorClickedEvent | ClearButtonClickedEvent | ResetClickedEvent>({
        operand1: ({ operand1 }) => `${parseFloat(operand1!)}`,
      }),
      assignOperand1Zero: assign<MachineContext, DecimalPointClickedEvent>({
        operand1: (_) => '0',
      }),
      assignOperand1NegativeZero: assign<MachineContext>({
        operand1: (_) => '-0',
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
      assignOperand2NegativeZero: assign<MachineContext>({
        operand2: (_) => '-0',
      }),
      assignOperator: assign<MachineContext, OperatorClickedEvent>({
        operator: (_, { data }) => data,
      }),
      assignResetContext: assign<MachineContext, ClearButtonClickedEvent | EqualSignClickedEvent | ResetClickedEvent>((_) => INITIAL_CONTEXT),
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
