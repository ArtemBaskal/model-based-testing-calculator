import { getShortestPaths, type Segment, type StatePathsMap } from "@xstate/graph";
import { machine } from "./machine";
import { type MachineContext, type MachineEvents } from "./type";
import { type ValueOf } from "../types";

export const scenarios = getShortestPaths(machine, {
  events: {
    DIGIT_CLICKED: [
      { type: 'DIGIT_CLICKED', data: 0 },
      { type: 'DIGIT_CLICKED', data: 1 }
    ],
    OPERATOR_CLICKED: [
      { type: 'OPERATOR_CLICKED', data: 'PLUS' },
      { type: 'OPERATOR_CLICKED', data: 'MINUS' },
      { type: 'OPERATOR_CLICKED', data: 'DIVIDE' },
    ],
    PERCENT_SIGN_CLICKED: [
      { type: 'PERCENT_SIGN_CLICKED' }
    ],
    DECIMAL_POINT_CLICKED: [
      { type: 'DECIMAL_POINT_CLICKED' }
    ],
    CLEAR_BUTTON_CLICKED: [
      { type: 'CLEAR_BUTTON_CLICKED' }
    ],
    EQUAL_SIGN_CLICKED: [
      { type: 'EQUAL_SIGN_CLICKED' }
    ],
    OK_BUTTON_CLICKED: [
      { type: 'OK_BUTTON_CLICKED' }
    ],
    RESET_CLICKED: [
      { type: 'RESET_CLICKED' }
    ],
  },
  filter: (state) =>
    (!state.context.operand1 || state.context.operand1.length < 3)
    && (!state.context.operand2 || state.context.operand2.length < 3),
});

function findScenario(predicate: (s: ValueOf<StatePathsMap<MachineContext, MachineEvents>>) => boolean) {
  return Object.values(scenarios).find(predicate);
}

export const scenario1 = findScenario(
  (scenario) => scenario.state.matches("AlertError")
);

export const scenario1Paths = scenario1!.paths;
export function getMeta(state: Segment<MachineContext, MachineEvents>['state']) {
  const keys = Object.keys(state.meta);
  return state.meta[keys[0]];
}
