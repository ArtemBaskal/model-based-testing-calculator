import { type Meta, type StoryObj } from "@storybook/react";
import { App } from "../../App";
import {
  fastForwardToErrorExit,
  fastForwardToOperand1One,
  fastForwardToOperand2Zero,
  fastForwardToOperatorDivide, fastForwardToReset, fastForwardToResult,
  fastForwardZeroDivision
} from "./fastForwardEvents";
import { Steps } from "./Steps";
import { States } from "./States";

const meta: Meta<typeof App> = {
  title: 'Calc',
  component: App,
};

export default meta;
type Story = StoryObj<typeof App>;

export const Start: Story = {
  render: () => <App />,
};

export const Operand1One: Story = {
  render: () => <App fastForwardEvents={fastForwardToOperand1One} />,
};

export const OperatorDivide: Story = {
  render: () => <App fastForwardEvents={fastForwardToOperatorDivide} />,
};

export const Operand2Zero: Story = {
  render: () => <App fastForwardEvents={fastForwardToOperand2Zero} />,
};
export const ZeroDivisionError: Story = {
  render: () => <App fastForwardEvents={fastForwardZeroDivision} />,
};

export const ZeroDivisionErrorExit: Story = {
  render: () => <App fastForwardEvents={fastForwardToErrorExit} />,
};

export const AfterReset: Story = {
  render: () => <App fastForwardEvents={fastForwardToReset} />,
};

export const ResultExample: Story = {
  render: () => <App fastForwardEvents={fastForwardToResult} />,
};
export const AlertErrorSteps: Story = {
  render: () => <Steps />,
};

export const AppStates: Story = {
  render: () => <States />,
};
