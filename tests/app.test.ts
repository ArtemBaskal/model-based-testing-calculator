import { test, expect } from '@playwright/test';
import { createModel } from '@xstate/test';
import { assign, createMachine } from "xstate";
import type { AnyStateMachine, EventObject } from "xstate";
import type { Page } from "playwright-core";
import type { TestPlan } from "@xstate/test/es/types";
import type {
  GuardFunc,
  MachineContext,
  MachineEvents,
  DigitClickedEvent,
  OperatorClickedEvent
} from "../src/machine/type";

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

const everyGuard =
  <T extends EventObject>(guards: GuardFunc<T>[]) =>
    (...args: Parameters<GuardFunc<T>>) =>
      guards.every(guard => guard(...args));

const isCurrentOperandZero = (context: MachineContext, { data }: DigitClickedEvent) => data === 0;

const isTheMinusOperator = (context: MachineContext, { data }: OperatorClickedEvent) => data === ArithmeticOperator.MINUS;

const isOperand2Zero = ({ operand2 }: MachineContext) => parseFloat(operand2!) === 0;

const isTheDivideOperator = ({ operator }: MachineContext) => operator === ArithmeticOperator.DIVIDE;

const isDivideByZero = everyGuard([isTheDivideOperator, isOperand2Zero])

const guards = {
  isCurrentOperandZero,
  isOperand2Zero,
  isTheMinusOperator,
  isDivideByZero,
}

const INITIAL_CONTEXT: MachineContext = {};

const assignOperator = assign<MachineContext, OperatorClickedEvent>({
  operator: (context, { data }) => data,
});

export const assignOperand2 = assign<MachineContext, DigitClickedEvent>({
  operand2: (context, { data }) => `${data}`,
});

export const assignOperand2Zero = assign<MachineContext>({
  operand2: '0',
});

const assignResetContext = assign<MachineContext>(() => INITIAL_CONTEXT);

const machineWithoutTests = createMachine(
  {
    predictableActionArguments: true,
    context: {},
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
        // type: 'history',
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
    actions: {
      assignOperator,
      assignOperand2,
      assignResetContext,
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
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] 0$/);
  },
  ['Operand2Entered.BeforeDecimalPoint']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?\d+$/);
  },
  ['Operand2Entered.AfterDecimalPoint']: async (page) => {
    await expect(page.locator('data-test=calc-input')).toHaveValue(/^-?\d+(\.\d+)? [+−×÷] -?\d+\.?\d*$/);
  },
  AlertError: async (page) => {
  await expect(page.locator('data-test=error-zero-division')).toContainText('Ошибка: Деление на ноль');
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
        { data: ArithmeticOperator.MULTIPLY },
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

test.describe('MBT', () => {
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

// test.describe('Should have full coverage', () => {
//   return model.testCoverage();
// });