import { test, expect, chromium } from '@playwright/test';
import { createModel } from '@xstate/test';
import { createMachine } from "xstate";
import type { AnyStateMachine } from "xstate";
import type { EventObject } from "xstate";
import type { Browser, Page } from "playwright-core";
import {
  DigitClickedEvent,
  OperatorClickedEvent
} from "../src/machine/type";
import type { TestPlan } from "@xstate/test/es/types";

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

export const everyGuard =
  <T extends EventObject>(guards) =>
    (...args) =>
      guards.every(guard => guard(...args));

export const isCurrentOperandZero = (context, { data }) => data === 0;

export const isTheMinusOperator = (context, { data }) => data === 'MINUS';

export const isOperand2Zero = ({ operand2 }) => parseFloat(operand2) === 0;

export const isTheDivideOperator = ({ operator }) => operator === 'DIVIDE';

export const isDivideByZero = everyGuard([isTheDivideOperator, isOperand2Zero])

export const guards = {
  isCurrentOperandZero,
  isOperand2Zero,
  isTheMinusOperator,
  isDivideByZero,
}

const machineWithoutTests = createMachine(
  {
    predictableActionArguments: true,
    context: {},
    initial: "Cluster",
    id: "Calc",
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
        initial: 'BeforeDecimalPoint',
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
  }
);

const machineWithTests = addTestsToMachine(machineWithoutTests, {
  Cluster: async (page) => {
    expect(page.locator('data-test=calc-input')).not.toHaveValue('NaN');
  },
  ['Cluster.Start']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^$/);
  },
  ['Cluster.Result']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)?$/);
  },
  NegativeNumber1: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-$/);
  },
  ['Operand1Entered.Zero']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^0$/);
  },
  ['Operand1Entered.BeforeDecimalPoint']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+$/);
  },
  ['Operand1Entered.AfterDecimalPoint']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+\.?\d*$/);
  },
  OperatorEntered: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] $/);
  },
  NegativeNumber2: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -$/);
  },
  ['Operand2Entered.Zero']: async (page) => {
    // FIXME: add -0 state
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] 0$/);
  },
  ['Operand2Entered.BeforeDecimalPoint']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?\d+$/);
  },
  ['Operand2Entered.AfterDecimalPoint']: async (page) => {
    expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?\d+\.?\d*$/);
  },
  AlertError: async (page) => {
  expect(page.locator('data-test=error-zero-division')).toContainText('Ошибка: Деление на ноль');
  expect(page.locator('data-test=commandOK')).toBeVisible();
  expect(page.locator('data-test=commandOK')).toContainText('OK');
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
        await page.click(`data-test=operator${data}`);
      },
      cases: [
        { data: 'PLUS' },
        { data: 'MINUS' },
        // { data: 'MULTIPLY' },
        { data: 'DIVIDE' }
      ],
    },
    PERCENT_SIGN_CLICKED: {
      exec: async (page) => {
        await page.click(`data-test=command${Commands.PERCENT}`);
      },
    },
    DECIMAL_POINT_CLICKED: {
      exec: async (page) => {
        await page.click(`data-test=command${Commands.DECIMAL_POINT}`);
      },
    },
    CLEAR_BUTTON_CLICKED: {
      exec: async (page) => {
        await page.click(`data-test=command${Commands.CLEAR}`);
      },
    },
    EQUAL_SIGN_CLICKED: {
      exec: async (page) => {
        await page.click(`data-test=command${Commands.EQUAL}`);
      },
    },
    OK_BUTTON_CLICKED: {
      exec: async (page) => {
        await page.click(`data-test=command${Commands.OK}`)
      }
    },
    RESET_CLICKED: {
      exec: async (page) => {
        await page.click(`data-test=command${Commands.RESET}`);
      }
    },
    // PARENTHESES_CLICKED: {
    //   exec: () => {
    //   }
    // },
  });

const testPlans = model.getSimplePathPlans();
// const testPlans = model.getSimplePathPlansTo('Cluster.Result');
// const testPlans = model.getSimplePathPlansTo('NegativeNumber1');
// const testPlans = model.getShortestPathPlans();
// const testPlans = model.getTestPlans()
// const testPlans = [model.getPlanFromEvents([
//   { type: 'OPERATOR_CLICKED', data: "MINUS" },
//   { type: 'DIGIT_CLICKED', data: 1 },
//   { type: 'DECIMAL_POINT_CLICKED' },
//   { type: 'DIGIT_CLICKED', data: 1 },
//   { type: 'OPERATOR_CLICKED', data: "MINUS" },
//   { type: 'DIGIT_CLICKED', data: 1 },
//   { type: 'DECIMAL_POINT_CLICKED' },
//   { type: 'EQUAL_SIGN_CLICKED' },
// ], {
//   target: 'Cluster.Result',
// })];

test.describe('Calculator', () => {
  let browser: Browser | undefined;
  let page: Page | undefined;

  test.beforeAll(async () => {
    browser = await chromium.launch();
    const context = await browser.newContext();
    page = await context.newPage();

    try {
      await page.goto('http://127.0.0.1:5173');
    } catch (e) {
      console.error(e);
    }
  });

  // test.afterEach(async ({ page }, testInfo) => {
  //   if (!process.env.CI && testInfo.status !== testInfo.expectedStatus) {
  //     process.stderr.write(
  //       `❌ ❌ PLAYWRIGHT TEST FAILURE ❌ ❌\n${
  //         testInfo.error?.stack || testInfo.error
  //       }\n`,
  //     )
  //     // testInfo.setTimeout(0)
  //     await page.pause();
  //   }
  // })

  test.afterAll(async () => {
    await browser!.close();
  });

  test.describe.parallel('MBT', async () => {
    dedupPathPlans
    (testPlans).forEach(plan => {
      // FIXME parallel exec of plans?
      test.describe(plan.description, () => {
        plan.paths.forEach(path => {
          test(path.description, async () => {
            await path.test(page!);
          });
        });
      });
    });
  });

  // test('should have full coverage', () => {
  //   return model.testCoverage();
  // })
})
