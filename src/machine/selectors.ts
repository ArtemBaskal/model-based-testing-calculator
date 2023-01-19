import { type State } from 'xstate/lib/State';
import { type MachineContext, type MachineEvents, type TypeState } from "./type";

export interface SelectorParams extends State<MachineContext, MachineEvents, {}, TypeState> {
}

export const selectOperand1 = ({ context }: SelectorParams) => context.operand1;

export const selectOperand2 = ({ context }: SelectorParams) => context.operand2;

export const selectOperator = ({ context }: SelectorParams) => context.operator;
