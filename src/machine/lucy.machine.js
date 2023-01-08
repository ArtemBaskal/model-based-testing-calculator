import { createMachine } from 'xstate';
import { assignOperator, assignOperandOneDividedByOneHundred, assignOperandOne, assignOperandOneZero, assignOperandOneDecimalPoint, assignOperandOneNegative, assignResetOperandOne, assignAddDigitToOperandOne, assignOperandOneParsedFloat, assignOperandTwo, assignOperandTwoZero, assignOperandTwoDecimalPoint, assignOperandTwoNegative, assignResetOperandTwo, assignAddDigitToOperandTwo, assignOperandTwoParsedFloat, assignOperandOneCalculated, assignResetOperator } from './assignActions.ts';

export function createCalc({ actions, context = {}, guards } = {}) {
  return createMachine({
    initial: 'Cluster',
    context,
    states: {
      Cluster: {
        on: {
          DIGIT_CLICKED: [
            {
              target: 'OperandOneEntered.Zero',
              cond: 'isCurrentOperandZero',
              actions: ['assignOperandOne']
            }, 
            {
              target: 'OperandOneEntered.BeforeDecimalPoint',
              actions: ['assignOperandOne']
            }
          ],
          DECIMAL_POINT_CLICKED: {
            target: 'OperandOneEntered.AfterDecimalPoint',
            actions: ['assignOperandOneZero', 'assignOperandOneDecimalPoint']
          }
        },
        context,
        states: {
          Start: {
            on: {
              OPERATOR_CLICKED: {
                target: 'Calc.NegativeNumberOne',
                cond: 'isTheMinusOperator'
              }
            }
          },
          Result: {
            on: {
              OPERATOR_CLICKED: {
                target: 'Calc.OperatorEntered',
                actions: ['assignOperator']
              },
              PERCENT_SIGN_CLICKED: {
                actions: ['assignOperandOneDividedByOneHundred']
              }
            }
          }
        }
      },
      NegativeNumberOne: {
        on: {
          DIGIT_CLICKED: {
            target: 'OperandOneEntered.BeforeDecimalPoint',
            actions: ['assignOperandOneNegative']
          },
          DECIMAL_POINT_CLICKED: {
            target: 'OperandOneEntered.AfterDecimalPoint',
            actions: ['assignOperandOneZero', 'assignOperandOneDecimalPoint']
          },
          CLEAR_BUTTON_CLICKED: {
            target: 'Cluster',
            actions: ['assignResetOperandOne']
          }
        }
      },
      OperandOneEntered: {
        on: {
          OPERATOR_CLICKED: {
            target: 'OperatorEntered',
            actions: ['assignOperator']
          },
          PERCENT_SIGN_CLICKED: {
            actions: ['assignOperandOneDividedByOneHundred']
          },
          CLEAR_BUTTON_CLICKED: {
            target: 'Cluster',
            actions: ['assignResetOperandOne']
          }
        },
        initial: 'BeforeDecimalPoint',
        context,
        states: {
          Zero: {
            on: {
              DIGIT_CLICKED: [
                {
                  cond: 'isCurrentOperandZero'
                }, 
                {
                  target: 'BeforeDecimalPoint',
                  actions: ['assignOperandOne']
                }
              ],
              DECIMAL_POINT_CLICKED: {
                target: 'AfterDecimalPoint',
                actions: ['assignOperandOneDecimalPoint']
              }
            }
          },
          BeforeDecimalPoint: {
            on: {
              DIGIT_CLICKED: {
                actions: ['assignAddDigitToOperandOne']
              },
              DECIMAL_POINT_CLICKED: {
                target: 'AfterDecimalPoint',
                actions: ['assignOperandOneDecimalPoint']
              }
            }
          },
          AfterDecimalPoint: {
            exit: ['assignOperandOneParsedFloat'],
            on: {
              DIGIT_CLICKED: {
                actions: ['assignAddDigitToOperandOne']
              }
            }
          }
        }
      },
      OperatorEntered: {
        on: {
          DIGIT_CLICKED: [
            {
              target: 'OperandTwoEntered.Zero',
              cond: 'isCurrentOperandZero',
              actions: ['assignOperandTwo']
            }, 
            {
              target: 'OperandTwoEntered.BeforeDecimalPoint',
              actions: ['assignOperandTwo']
            }
          ],
          DECIMAL_POINT_CLICKED: {
            target: 'OperandTwoEntered.AfterDecimalPoint',
            actions: ['assignOperandTwoZero', 'assignOperandTwoDecimalPoint']
          },
          OPERATOR_CLICKED: [
            {
              target: 'NegativeNumberTwo',
              cond: 'isTheMinusOperator'
            }, 
            {
              target: 'OperatorEntered',
              actions: ['assignOperator']
            }
          ]
        }
      },
      NegativeNumberTwo: {
        on: {
          DIGIT_CLICKED: [
            {
              target: 'OperandTwoEntered.Zero',
              cond: 'isCurrentOperandZero',
              actions: ['assignOperandTwo']
            }, 
            {
              target: 'OperandTwoEntered.BeforeDecimalPoint',
              actions: ['assignOperandTwoNegative']
            }
          ],
          DECIMAL_POINT_CLICKED: {
            target: 'OperandTwoEntered.AfterDecimalPoint',
            actions: ['assignOperandTwoZero', 'assignOperandTwoDecimalPoint']
          },
          CLEAR_BUTTON_CLICKED: {
            target: 'OperatorEntered',
            actions: ['assignResetOperandTwo']
          }
        }
      },
      OperandTwoEntered: {
        on: {
          EQUAL_SIGN_CLICKED: [
            {
              target: 'AlertError',
              cond: 'isDivideByZero'
            }, 
            {
              target: 'Cluster.Result',
              actions: ['assignOperandOneCalculated', 'assignResetOperandTwo', 'assignResetOperator']
            }
          ],
          OPERATOR_CLICKED: {
            target: 'OperatorEntered',
            actions: ['assignOperator']
          },
          CLEAR_BUTTON_CLICKED: {
            target: 'OperatorEntered',
            actions: ['assignResetOperandTwo']
          }
        },
        initial: 'BeforeDecimalPoint',
        context,
        states: {
          Zero: {
            on: {
              DIGIT_CLICKED: [
                {
                  cond: 'isCurrentOperandZero'
                }, 
                {
                  target: 'BeforeDecimalPoint',
                  actions: ['assignOperandTwo']
                }
              ],
              DECIMAL_POINT_CLICKED: {
                target: 'AfterDecimalPoint',
                actions: ['assignOperandTwoDecimalPoint']
              }
            }
          },
          BeforeDecimalPoint: {
            on: {
              DIGIT_CLICKED: {
                actions: ['assignAddDigitToOperandTwo']
              },
              DECIMAL_POINT_CLICKED: {
                target: 'AfterDecimalPoint',
                actions: ['assignOperandTwoDecimalPoint']
              }
            }
          },
          AfterDecimalPoint: {
            exit: ['assignOperandTwoParsedFloat'],
            on: {
              DIGIT_CLICKED: {
                actions: ['assignAddDigitToOperandTwo']
              }
            }
          }
        }
      },
      AlertError: {
        on: {
          OK_BUTTON_CLICKED: {
            target: 'OperandTwoEntered',
            actions: ['assignResetOperandTwo']
          }
        }
      }
    }
  }, {
    actions: {
      assignResetOperandTwo: actions.assignResetOperandTwo
    }
  });
}