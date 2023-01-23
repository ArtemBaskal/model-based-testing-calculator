import { test, expect } from '@playwright/test';
import { createModel } from '@xstate/test';
import { assign, createMachine, type AnyStateMachine } from "xstate";
import { type Page } from "playwright-core";
import { type TestPlan } from "@xstate/test/es/types";
import {
  type MachineContext,
  type MachineEvents,
  type DigitClickedEvent,
  type OperatorClickedEvent,
  type TypeState,
} from "../src/machine/type";
import * as fc from 'fast-check';
import { type ValueOf } from "../src/types";

/**
 * Adds state.meta.test to machines by their state id -
 * allowing you to specify the tests separately to the
 * machine itself
 */
export const addTestsToMachine = (
  /**
   * The machine you want to add tests to
   */
  machine: AnyStateMachine,
  /**
   * The tests, specified as a keyed object, where:
   *
   * 1. Keys are the state ids
   * 2. Values are functions that take your test context
   *   and return a promise
   */
  // @ts-ignore
  tests: Record<string, (page: Page, state) => Promise<void>>,
) => {
  Object.entries(tests).forEach(([stateId, test]) => {
    const node = machine.getStateNodeById(`${machine.id}.${stateId}`);

    if (tests[stateId]) {
      node.meta = {
        test: tests[stateId],
      };
    }
  });

  return machine;
};

/**
 * Deduplicates your path plans so that A -> B
 * is not executed separately to A -> B -> C
 */
export const dedupPathPlans = <TTestContext>(
  pathPlans: TestPlan<TTestContext, any>[],
): TestPlan<TTestContext, any>[] => {
  const planPathSegments = pathPlans.map((plan) => {
    const planSegments = plan.paths[0].segments.map((segment) =>
      JSON.stringify(segment.event),
    );

    return planSegments;
  });

  /**
   * Filter out the paths that are just shorter versions
   * of other paths
   */
  const filteredPathPlans = pathPlans.filter((plan, index) => {
    const planSegments = planPathSegments[index];

    if (planSegments.length === 0) return false;

    const concatenatedPlanSegments = planSegments.join("");

    return !planPathSegments.some((planPathSegmentsToCompare) => {
      const concatenatedSegmentToCompare = planPathSegmentsToCompare.join("");
      /**
       * Filter IN (return false) if it's the same as the current plan,
       * because it's not a valid comparison
       */
      if (concatenatedSegmentToCompare === concatenatedPlanSegments) {
        return false;
      }

      /**
       * Filter IN (return false) if the plan to compare against has length 0
       */
      if (planPathSegmentsToCompare.length === 0) {
        return false;
      }

      /**
       * We filter OUT (return true)
       */
      return concatenatedSegmentToCompare.includes(concatenatedPlanSegments);
    });
  });

  return filteredPathPlans;
};

const ArithmeticOperator = {
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
} as const;

const INITIAL_CONTEXT: MachineContext = {};

const machineWithoutTests = createMachine<MachineContext, MachineEvents, TypeState>({
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
      isCurrentOperandZero: (_, { data }: DigitClickedEvent) => data === 0,
      isTheMinusOperator: (_, { data }: OperatorClickedEvent) => data === ArithmeticOperator.MINUS,
      isDivideByZero: (context: MachineContext) => {
        const { operator, operand2 } = context;
        return operator! === ArithmeticOperator.DIVIDE && parseFloat(operand2!) === 0;
      },
    },
    actions: {
      assignOperator: assign<MachineContext, OperatorClickedEvent>({
        operator: (_, { data }) => data,
      }),
      assignOperand2: assign<MachineContext, DigitClickedEvent>({
        operand2: (_, { data }) => `${data}`,
      }),
      assignOperand2Zero: assign({
        operand2: (_) => '0',
      }),
      assignResetContext: assign((_) => INITIAL_CONTEXT),
      assignResetOperator: assign({
        operator: (_) => INITIAL_CONTEXT.operator,
      })
    },
  }
);

const machineWithTests = addTestsToMachine(machineWithoutTests, {
  Cluster: async (page) => {
    await expect(page.locator('data-test=calc-input')).not.toHaveValue('NaN');
  },
  ['Cluster.Start']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^$/);
  },
  ['Cluster.Result']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)?$/);
  },
  NegativeNumber1: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-$/);
  },
  ['Operand1Entered.Zero']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^0$/);
  },
  ['Operand1Entered.BeforeDecimalPoint']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+$/);
  },
  ['Operand1Entered.AfterDecimalPoint']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+\.?\d*$/);
  },
  OperatorEntered: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] $/);
  },
  NegativeNumber2: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -$/);
  },
  ['Operand2Entered.Zero']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?0$/);
  },
  ['Operand2Entered.BeforeDecimalPoint']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?\d+$/);
  },
  ['Operand2Entered.AfterDecimalPoint']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?\d+\.?\d*$/);
  },
  AlertError: async (page) => {
    await expect(page.locator('data-test=error-zero-division')).toContainText('Error: Division by Zero');
    await expect(page.locator('data-test=commandOK')).toBeVisible();
    await expect(page.locator('data-test=commandOK')).toContainText('OK');
  },
})

const Commands = {
  EQUAL: 'EQUAL',
  DECIMAL_POINT: 'DECIMAL_POINT',
  PERCENT: 'PERCENT',
  CLEAR: 'CLEAR',
  RESET: 'RESET',
  OK: 'OK',
  PARENTHESES: 'PARENTHESES',
};

const model = createModel<Page>(machineWithTests).withEvents(
  {
    DIGIT_CLICKED: {
      exec: async (page, { data }: DigitClickedEvent) => {
        await page.click(`data-test=digit${data}`);
      },
      cases: [
        { data: 0 },
        { data: 1 },
        // { data: 2 },
        // { data: 3 },
        // { data: 4 },
        // { data: 5 },
        // { data: 6 },
        // { data: 7 },
        // { data: 8 },
        // { data: 9 },
      ],
    },
    OPERATOR_CLICKED: {
      exec: async (page, { data }: OperatorClickedEvent) => {
        await page.locator(`data-test=operator${data}`).click();
      },
      cases: [
        { data: ArithmeticOperator.PLUS },
        { data: ArithmeticOperator.MINUS },
        // { data: ArithmeticOperator.MULTIPLY },
        { data: ArithmeticOperator.DIVIDE },
      ],
    },
    PERCENT_SIGN_CLICKED: {
      exec: async (page) => {
        await page.locator(`data-test=command${Commands.PERCENT}`).click();
      },
    },
    DECIMAL_POINT_CLICKED: {
      exec: async (page) => {
        await page.locator(`data-test=command${Commands.DECIMAL_POINT}`).click();
      },
    },
    CLEAR_BUTTON_CLICKED: {
      exec: async (page) => {
        await page.locator(`data-test=command${Commands.CLEAR}`).click();
      },
    },
    EQUAL_SIGN_CLICKED: {
      exec: async (page) => {
        await page.locator(`data-test=command${Commands.EQUAL}`).click();
      },
    },
    OK_BUTTON_CLICKED: {
      exec: async (page) => {
        await page.locator(`data-test=command${Commands.OK}`).click();
      }
    },
    RESET_CLICKED: {
      exec: async (page) => {
        await page.locator(`data-test=command${Commands.RESET}`).click();
      }
    },
    // PARENTHESES_CLICKED: {
    //   exec: () => {
    //   }
    // },
  });

test.describe.parallel('MBT', () => {
  const testPlans = model.getShortestPathPlans();

  dedupPathPlans(testPlans).forEach((plan) => {
    test.describe(plan.description, () => {
      plan.paths.forEach((path) => {
        test(path.description, async ({ page }) => {
          await page.goto(`/`);
          await path.test(page);
        })
      })
    })
  });
});
