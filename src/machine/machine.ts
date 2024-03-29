import { and, assertEvent, assign, setup } from "xstate";
import {
  type EqualSignClickedEvent,
  type MachineContext,
  type MachineEvents,
  ArithmeticOperator,
  INITIAL_CONTEXT,
} from "./type";
import { MachineEventTypes } from "./events";
export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGECGAbAxgYgEoFEBlfAFQH1kAZASWQGl8ARAbQAYBdRUABwHtYAlgBcBvAHZcQAD0QA2AEwAOAHQB2AJyL16jQEZWrBbIA0IAJ6IAzIt3LNs3btmLWAVlWLL8gCwBfX6ZoWMrI6ACusEJgAE7YjNQA4tTkVLQMLBySfIIi4pIyCE7eyrqq3rry6paqlqzybvKmFghaqiU+hg6supbe3f6BGJgh4ZExcYnJFDT0TMy6nEgg2cKiEksF7q7KrvKuruqysjX1Hk2IWqzKspaH7h46rF4DIEHDoRFRsYz4yNQAsgBBShkAAKAHlqAA5FIzdJsRY8firPIbRC6bzqYqqDTaVyKPo6fbnFo4ko3XQ2VSuRyaVQvN4jT4xZSEISoaJCbDg0H4XCAkjg3DTNJzTJLFa5dagAoYxTyNQaRQHdTuSwKSwk-a2DRKBSsKqWLyuBlDJljaLKXBwMLoLk8vkCoUi2YZRHLZFS-KIAC01QV3i8Nw8qh8+PUJN0OhUupxx1k6nk8g0puCHwtVptduwvNwyHwMLIhESUJd8PFSJya29CGs23ktwN1MO6vUTi1oeUyvcsgOunxT0UqeGULAUFQIgAbmAoWEALYAIxiugmSVhordWU91bRCHkFXUylYigcTgb3jKnkjrluJW0pQxmJPiiHAVeZtH46nM-nS+iK-iNcyzmBYtyrVEZUQeonDsY9HAeXsNG8SNVDcHZ+wcI5KW0dRh2UT8JwEadZ0XZc4l+AFgTBSFC1SV0ETAlFpWkKCDEPVxAxqTFMSNJNI0sfY1AOZxk0TSk3DwgjvxIv8VyofBAWFAAhABVEhBVLOjy3dSUd0gwpZDqI8egqeRDKjalXBJBND17dVvAOboG16PDwW4GJUDECBdHwMQvkgblcydYUtLFHTtwglja0xOxvFkbxPBxQlyhJeoG0VMzVA1HwjFc9zok87zfP8iAcz5fNC2LBJNLhMLGK9XcfSjWQ7CcJ4KlYVQemTExzEQFtriUfZKgcSxSjyjyvJ8vyYgC+TFLIVT1PBGqNwYiUIuYgpLjsdVamqOpvAcqy+padQrhuaNDLbZN5AmgqpuK2aIGUAAtGJeFXKZQs3DbwK2xBvGTZRMXiyp8T1Y9euaCoCTUfVQ0MwxVXuwrppKt6Pq+9d6NAv6mJrBzLHJC8bmORNVUUfiPHh04zIMBMTTfRk3MmoqZuiSBMeiT6fj+IEQQhaEce0+q9Kiky2lxHwMW0E82xQxQ2n0CnqlqDj4tRx6Oa5pSwAAM14TnGDATABDnDBQV4AQ-Ox4DfsrAnd0TYp+3KZMlfO6oI1O0yrlqd3eg8Btdi19mMb1w3jdN83Let22+cowWaJFur8Ya-THDhupXE6noA5caH0T6FrNEqdUNDqXQw-R57lEBfWvhNs2LfQK2ba5QDvtqh2PX+msnBp+UctYBLkxxRpfajK4amHykMWOUfUaEI2ns50qu9T3vdMigozJanFbkMpQ9sMTVTobfQjzisagbM2Hl9XnWN8mLf5nC-vd17WxOs8E9KgJFoE6zQfCoRKNYJwXgCRPHpMzM0rMCor2iGvAKicBbUWFvbdajsM5RU0MUI6E96jyjGr2VKR0VDuH-rdNsWJZCP2Qc-QKjpBQhR7tgvuTtM6UmJloMmhhD7ylSgYHUCYvCjwbLlOBwQEETifiVZh-JWFYLxjg8WspKTYgJKUBwQMlZmWESeEG984pbCeEzQYwQpJER-KRaI8g7Y-Q4TvAGe4KjbBxDUAwQNYYORJGNSkygxrjyVqGRw+xJJjkIsRX8MQHGbxUR-LhUU0o-06koOofCAn+IyTsPYIklBdWqJEr8NiZJxPIvzKiQtaLsIrJw3BsptBXHcb0NwfRXBHB9iAk82wDgT3cA2MoETpEjiidJWJ9jsDzWUmpDSWD6kuIHnsC6tRqTe3innVKRpihHF2MeTxUYHJh3kCg0q+AACKKkqJVVWvRRZm0aw3l2S4GkzhUJHBuP4jith5YOU8Q5TiJyznYEudckEtzEli13r6fE2wxoCSDheJy-jwkg24glbQfQ-CjOULIrypymEOiUc6JxDzP76R9HsZWllqTHiUC4ZCF8HItSwr2BKdQqi9mBUwmZi05krQWUkxpvpsUlEDJ4fQ7tTKpS6i1I63RSj7D4Z4HlGN3o80cXU4V6j0RaBBhUOUCYuo8VSp4YmCY3bnTDBUNVdcNW81flC9OuqEA-JKJ1coSsMTUkcKlHQConiHXsvuXCuL8UQEJeqrGaDqkpyFdC1xNgFSdOVAaASvr9z+KNC1BF1IHDKiBiMyxwwI1RrrpHI2YBm6xzbvHTuTqyU6phQgeKytPmVD2AlHxsqYIKvgsqw4qrw35UKuW9eyhK3RxbnHDulSk4YNqWtclySNEviCWUUhiYDAHCpqdWohgux7JlnGPYlg7UTobk3GOrd24J0bdqxNA8aRXE8AoOKpxSiqFlQ5a4BJexHF4vic9uLAToBiEIfA0QeaxHBHQfly07mixdS2-sSYj0nkDMcG8Ltvn1GUPuZU2Ed2Bn8G+MQvAIBwEkG8J9jUbjEwRc8soqEKj+oISeB8hHuidLwumL4dH9KVDaEaakoZDgOW8SSBK8L9ioT6LcJMki+OjC+KydknJBNRRsLYcot9EbqieFqRMOwRKoTbPFJwKnmSWmtLAW0QgtMFF6PC6ogyJO51HiSUMWjuw300HUO6uLrExLsboJzUE3bXAZu1DiBxgFyF2EefEUYkyBaGjXM5EW3EqAwqqeCFN8SRn0MTBsBIbyiaOhY98MjR3a2jTzbL+8SidPy6UQre6YZVbUAaMeRoxrHky8-SdBsq01tvfW7L8oVA2F6E4G4RHOmRjvjsJCuiEwviVkNjGV6YjjdnX5bLGJ3A9b4fuXO7Xz4w2sAQhQWIv29FAQwrLKHXE3jaFUXOQMjgKYvKleoh5OWqlAXFJ4IGS34XGWUyZ8gjuqmJk4N2jLMRKCZSAhsVxkzeK+x4BK4Oaulrq5Gl7aiW1mS7G2XYpwKtVDR1BBQKgsTdAMFoVnr4IdlrOcoAAEgISIRtmik9cRhBUHsKRYh0F4b9+61ZqGtUDeTNgqgXq5g67LZQKdoep0aWn-qbgEZfMeIMo8PD45ZkT8dutRvTtrXexzr2az-wI1leU+JqRxWVP60oXYWeGEcG4SkKuXq7eiPtutHcju53hZZbQeg+jUi920FwnRdgcUOPQ0D4HORQZg9l3s2wehZSyvUawkj-FdCCedak+4HBdSs2RoAA */
  setup({
      types: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      guards: {
        isCurrentOperandZero: ({ event }) => {
          assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

          return event.data === 0;
        },
        isTheMinusOperator: ({ event }) => {
          assertEvent(event, MachineEventTypes.OPERATOR_CLICKED);

          return event.data === ArithmeticOperator.MINUS;
        },
        isOperatorZero: function ({ context: { operator }, event }) {
          assertEvent(event, MachineEventTypes.EQUAL_SIGN_CLICKED);

          return operator === ArithmeticOperator.DIVIDE;
        },
        isOperand2Zero: ({ context: { operand2 }, event }) => {
          assertEvent(event, MachineEventTypes.EQUAL_SIGN_CLICKED);

          return parseFloat(operand2!) === 0;
        },
      },
      actions: {
        assignAddDigitToOperand1: assign({
          operand2: ({ context: { operand1 }, event }) => {
            assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

            return `${operand1!}${event.data}`;
          },
        }),
        assignAddDigitToOperand2: assign({
          operand2: ({ context: { operand2 }, event }) => {
            assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

            return `${operand2!}${event.data}`;
          },
        }),
        assignOperand1: assign({
          operand1: ({ event }) => {
            assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

            return `${event.data}`;
          },
        }),
        assignOperand1Calculated: assign({
          operand1: ({ context: { operand1, operand2, operator }}) => {
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
        assignOperand1DecimalPoint: assign({
          operand1: ({ context: { operand1 }}) => `${operand1!}.`,
        }),
        assignOperand1DividedBy100: assign({
          operand1: ({ context: { operand1 }}) => `${parseFloat(operand1!) / 100}`,
        }),
        assignOperand1Negative: assign({
          operand1: ({ event }) => {
            assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

            return `-${event.data}`;
          },
        }),
        assignOperand1ParsedFloat: assign({
          operand1: ({ context: { operand1 }}) => `${parseFloat(operand1!)}`,
        }),
        assignOperand1Zero: assign({
          operand1: () => '0',
        }),
        assignOperand1NegativeZero: assign({
          operand1: () => '-0',
        }),
        assignOperand2: assign({
          operand2: ({ event }) => {
            assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

            return `${event.data}`;
          },
        }),
        assignOperand2DecimalPoint: assign({
          operand2: ({ context: { operand2 }}) => `${operand2!}.`,
        }),
        assignOperand2Negative: assign({
          operand2: ({ event }) => {
            assertEvent(event, MachineEventTypes.DIGIT_CLICKED);

            return `-${event.data}`;
          },
        }),
        assignOperand2ParsedFloat: assign({
          operand2: ({ context: { operand2 }}) => `${parseFloat(operand2!)}`,
        }),
        assignOperand2Zero: assign({
          operand2: () => '0',
        }),
        assignOperand2NegativeZero: assign({
          operand2: () => '-0',
        }),
        assignOperator: assign({
          operator: ({ event }) => {
            assertEvent(event, MachineEventTypes.OPERATOR_CLICKED);

            return event.data;
          },
        }),
        assignResetContext: assign(() => INITIAL_CONTEXT),
        assignResetOperand1: assign({
          operand1: () => INITIAL_CONTEXT.operand1,
        }),
        assignResetOperand2: assign({
          operand2: () => INITIAL_CONTEXT.operand2,
        }),
        assignResetOperator: assign({
          operator: () => INITIAL_CONTEXT.operator,
        }),
      },
    }
  ).createMachine(
    {
      context: INITIAL_CONTEXT,
      initial: "Cluster",
      id: "Calc",
      states: {
        Cluster: {
          initial: "Start",
          meta: {
            description: 'Cluster'
          },
          states: {
            Start: {
              meta: {
                description: 'Starting State'
              },
              entry: ['assignResetContext'],
              on: {
                OPERATOR_CLICKED: {
                  meta: {
                    description: "-"
                  },
                  description: "-",
                  guard: 'isTheMinusOperator',
                  target: "#Calc.NegativeNumber1",
                },
              },
            },
            Result: {
              meta: {
                description: 'Resulting State'
              },
              on: {
                OPERATOR_CLICKED: {
                  meta: {
                    description: "+ - * /"
                  },
                  description: "+ - * /",
                  actions: ['assignOperator'],
                  target: "#Calc.OperatorEntered",
                },
                PERCENT_SIGN_CLICKED: {
                  meta: {
                    description: "%"
                  },
                  description: "%",
                  actions: ['assignOperand1DividedBy100'],
                },
              },
            },
          },
          on: {
            DIGIT_CLICKED: [
              {
                meta: {
                  description: "0"
                },
                description: "0",
                guard: 'isCurrentOperandZero',
                actions: ['assignOperand1Zero'],
                target: "Operand1Entered.Zero",
              },
              {
                meta: {
                  description: "1-9"
                },
                description: "1-9",
                actions: ['assignOperand1'],
                target: "Operand1Entered.BeforeDecimalPoint",
              }
            ],
            DECIMAL_POINT_CLICKED: {
              meta: {
                description: "."
              },
              description: ".",
              actions: ['assignOperand1Zero', 'assignOperand1DecimalPoint'],
              target: "Operand1Entered.AfterDecimalPoint",
            },
          },
        },

        NegativeNumber1: {
          meta: {
            description: 'Negative Number 1'
          },
          on: {
            DIGIT_CLICKED: [
              {
                meta: {
                  description: "0"
                },
                description: "0",
                guard: 'isCurrentOperandZero',
                actions: ['assignOperand1Negative'],
                target: "Operand1Entered.Zero",
              },
              {
                meta: {
                  description: "1-9"
                },
                description: "1-9",
                actions: ['assignOperand1Negative'],
                target: "Operand1Entered.BeforeDecimalPoint",
              },
            ],
            DECIMAL_POINT_CLICKED: {
              meta: {
                description: "."
              },
              description: ".",
              actions: ['assignOperand1NegativeZero', 'assignOperand1DecimalPoint'],
              target: "Operand1Entered.AfterDecimalPoint",
            },
            CLEAR_BUTTON_CLICKED: {
              meta: {
                description: "CE"
              },
              description: "CE",
              target: "Cluster.Start",
            },
          },
        },

        Operand1Entered: {
          meta: {
            description: 'Operand 1 Entered'
          },
          initial: 'Zero',
          states: {
            Zero: {
              meta: {
                description: 'Zero'
              },
              on: {
                DIGIT_CLICKED: [
                  {
                    meta: {
                      description: "0"
                    },
                    description: "0",
                    guard: 'isCurrentOperandZero',
                  },
                  {
                    meta: {
                      description: "1-9"
                    },
                    description: "1-9",
                    actions: ['assignOperand1'],
                    target: "BeforeDecimalPoint",
                  }
                ],
                DECIMAL_POINT_CLICKED: {
                  meta: {
                    description: "."
                  },
                  description: ".",
                  actions: ['assignOperand1DecimalPoint'],
                  target: "AfterDecimalPoint",
                },
              },
            },
            BeforeDecimalPoint: {
              meta: {
                description: 'Before Decimal Point'
              },
              on: {
                DIGIT_CLICKED: {
                  actions: ['assignAddDigitToOperand1'],
                  meta: {
                    description: "0-9"
                  },
                  description: "0-9",
                },
                DECIMAL_POINT_CLICKED: {
                  meta: {
                    description: "."
                  },
                  description: ".",
                  actions: ['assignOperand1DecimalPoint'],
                  target: "AfterDecimalPoint",
                },
              },
            },
            AfterDecimalPoint: {
              meta: {
                description: 'After Decimal Point'
              },
              exit: ['assignOperand1ParsedFloat'],
              on: {
                DIGIT_CLICKED: {
                  meta: {
                    description: "0-9"
                  },
                  description: "0-9",
                  actions: ['assignAddDigitToOperand1'],
                },
              },
            },
          },
          on: {
            OPERATOR_CLICKED: {
              meta: {
                description: "+ - * /"
              },
              description: "+ - * /",
              actions: ['assignOperator'],
              target: "OperatorEntered",
            },
            PERCENT_SIGN_CLICKED: {
              meta: {
                description: "%"
              },
              description: "%",
              actions: ['assignOperand1DividedBy100'],
              target: 'Cluster.Result',
            },
            CLEAR_BUTTON_CLICKED: {
              meta: {
                description: "CE"
              },
              description: "CE",
              target: "Cluster",
            },
          },
        },

        OperatorEntered: {
          meta: {
            description: 'Operator Entered'
          },
          on: {
            DIGIT_CLICKED: [
              {
                meta: {
                  description: "0"
                },
                description: "0",
                guard: 'isCurrentOperandZero',
                actions: ['assignOperand2Zero'],
                target: "Operand2Entered.Zero",
              },
              {
                actions: ['assignOperand2'],
                meta: {
                  description: "1-9"
                },
                description: "1-9",
                target: "Operand2Entered.BeforeDecimalPoint",
              }
            ],
            DECIMAL_POINT_CLICKED: {
              meta: {
                description: "."
              },
              description: ".",
              actions: ['assignOperand2Zero', 'assignOperand2DecimalPoint'],
              target: "Operand2Entered.AfterDecimalPoint",
            },
            OPERATOR_CLICKED: [
              {
                meta: {
                  description: "-"
                },
                description: "-",
                guard: 'isTheMinusOperator',
                target: "NegativeNumber2",
              },
              {
                meta: {
                  description: "+ * /"
                },
                description: "+ * /",
                actions: ['assignOperator'],
                target: "OperatorEntered",
              }
            ],
          },
        },

        NegativeNumber2: {
          meta: {
            description: 'Negative Number 2'
          },
          on: {
            DIGIT_CLICKED: [
              {
                meta: {
                  description: "0"
                },
                description: "0",
                guard: 'isCurrentOperandZero',
                actions: ['assignOperand2Negative'],
                target: "Operand2Entered.Zero",
              },
              {
                actions: ['assignOperand2Negative'],
                meta: {
                  description: "1-9"
                },
                description: "1-9",
                target: "Operand2Entered.BeforeDecimalPoint",
              }
            ],
            DECIMAL_POINT_CLICKED: {
              meta: {
                description: "."
              },
              description: ".",
              actions: ['assignOperand2NegativeZero', 'assignOperand2DecimalPoint'],
              target: "Operand2Entered.AfterDecimalPoint",
            },
            CLEAR_BUTTON_CLICKED: {
              meta: {
                description: "CE"
              },
              description: "CE",
              target: "OperatorEntered",
            },
          },
        },

        Operand2Entered: {
          meta: {
            description: 'Operand 2 Entered'
          },
          initial: 'Zero',
          states: {
            History: {
              type: 'history',
            },
            Zero: {
              meta: {
                description: 'Zero'
              },
              on: {
                DIGIT_CLICKED: [
                  {
                    meta: {
                      description: "0"
                    },
                    description: "0",
                    guard: 'isCurrentOperandZero',
                  },
                  {
                    meta: {
                      description: "1-9"
                    },
                    description: "1-9",
                    actions: ['assignOperand2'],
                    target: "BeforeDecimalPoint",
                  }
                ],
                DECIMAL_POINT_CLICKED: {
                  meta: {
                    description: "."
                  },
                  description: ".",
                  actions: ['assignOperand2DecimalPoint'],
                  target: "AfterDecimalPoint",
                },
              },
            },
            BeforeDecimalPoint: {
              meta: {
                description: 'Before Decimal Point'
              },
              on: {
                DIGIT_CLICKED: {
                  actions: ['assignAddDigitToOperand2'],
                  meta: {
                    description: "0-9"
                  },
                  description: "0-9",
                },
                DECIMAL_POINT_CLICKED: {
                  meta: {
                    description: "."
                  },
                  description: ".",
                  actions: ['assignOperand2DecimalPoint'],
                  target: "AfterDecimalPoint",
                },
              },
            },
            AfterDecimalPoint: {
              meta: {
                description: 'After Decimal Point'
              },
              on: {
                DIGIT_CLICKED: {
                  meta: {
                    description: "0-9"
                  },
                  description: "0-9",
                  actions: ['assignAddDigitToOperand2'],
                },
              },
            },
          },
          on: {
            EQUAL_SIGN_CLICKED: [
              {
                meta: {
                  description: "="
                },
                description: "=",
                guard: and([
                  'isOperatorZero',
                  'isOperand2Zero'
                ]),
                target: "AlertError",
              },
              {
                meta: {
                  description: "="
                },
                description: "=",
                actions: ['assignOperand1Calculated', 'assignResetOperand2', 'assignResetOperator'],
                target: "Cluster.Result",
              },
            ],
            OPERATOR_CLICKED: {
              meta: {
                description: "+ * /"
              },
              description: "+ * /",
              actions: ['assignResetOperand2', 'assignOperator'],
              target: "OperatorEntered",
            },
            CLEAR_BUTTON_CLICKED: {
              meta: {
                description: "CE"
              },
              description: "CE",
              actions: ['assignResetOperand2'],
              target: "OperatorEntered",
            },
          },
        },

        // TODO: modal
        AlertError: {
          meta: {
            description: 'Alert Error'
          },
          on: {
            OK_BUTTON_CLICKED: {
              meta: {
                description: "OK"
              },
              description: "OK",
              target: "Operand2Entered.History",
            }
          },
        }
      },
      on: {
        RESET_CLICKED: {
          meta: {
            description: "C"
          },
          description: "C",
          target: ".Cluster",
        },
      },
    });
