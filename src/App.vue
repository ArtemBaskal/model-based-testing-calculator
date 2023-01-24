<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { useMachine } from '@xstate/vue';
import { machine } from './machine/machine';
import { MachineEventTypes } from './machine/events';
import { ArithmeticOperatorMap, COMMANDS, Commands, CommandsMap, DIGITS, OPERATORS } from './common';
import { getKeyboardInputHandler } from './helpers';
import './App.css';

export default defineComponent({
  name: 'App',
  setup() {
    const { state, send } = useMachine(machine, { devTools: true });

    const keyboardInputHandler = getKeyboardInputHandler(send);

    onMounted(() => {
      document.addEventListener('keydown', keyboardInputHandler);
    });
    onUnmounted(() => {
      document.removeEventListener('keydown', keyboardInputHandler);
    });

    return {
      state,
      send,
      ArithmeticOperatorMap,
      MachineEventTypes,
      CommandsMap,
      Commands,
      DIGITS,
      OPERATORS,
      COMMANDS,
    }
  },
})
</script>

<template>
  <div class="App">
    <div v-if="state.matches('AlertError')">
      <button
          type="button"
          data-test="commandOK"
          @click="send({ type: MachineEventTypes.OK_BUTTON_CLICKED })"
          :disabled="!state.can(MachineEventTypes.OK_BUTTON_CLICKED)"
      >
        OK
      </button>
      <div data-test="error-zero-division" class="error-message">Error: Division by Zero</div>
    </div>
    <input type="text" readonly class="calc-input" data-test="calc-input" :value="
          `${
            state.matches('NegativeNumber1')
              ? '-'
              : ''
          }${
            state.matches({ Cluster: 'Start' })
            || state.matches('NegativeNumber1')
              ? ''
              : state.context.operand1
          }${
            state.matches('OperatorEntered')
            || state.matches('NegativeNumber2')
            || state.matches('Operand2Entered')
            || state.matches('AlertError')
              ? ` ${ArithmeticOperatorMap[state.context.operator].displaySign} `
              : ''
          }${
            state.matches('NegativeNumber2')
              ? '-'
              : ''
          }${
            state.matches('Operand2Entered')
            || state.matches('AlertError')
              ? state.context.operand2
              : ''
          }`">
    <div class="container">
      <section class="commands-section">
        <button
            v-for="{ 'data-test': dataTest, eventType, displaySign } in COMMANDS"
            type="button"
            :key="dataTest"
            :data-test="'command' + dataTest"
            @click="send({ type: eventType })"
            :disabled="!state.can({ type: eventType })"
        >
          {{ displaySign }}
        </button>

      </section>
      <section class="digits-section">
        <button
            v-for="digit in DIGITS"
            type="button"
            :key="digit"
            :data-test="'digit' + digit"
            @click="send({ type: MachineEventTypes.DIGIT_CLICKED, data: digit })"
            :disabled="!state.can({ type: MachineEventTypes.DIGIT_CLICKED, data: digit })"
        >
          {{ digit }}
        </button>
        <button
            v-for="{ 'data-test': dataTest, eventType, displaySign } in
            [
              CommandsMap[Commands.DECIMAL_POINT],
              CommandsMap[Commands.EQUAL],
            ]"
            type="button"
            :key="dataTest"
            :data-test="'command' + dataTest"
            @click="send({ type: eventType })"
            :disabled="!state.can({ type: eventType })"
        >
          {{ displaySign }}
        </button>
      </section>
      <section class="operators-section">
        <button
            v-for="({ operator, displaySign }) in OPERATORS"
            type="button"
            :key="operator"
            :data-test="'operator' + operator"
            @click="send({ type: MachineEventTypes.OPERATOR_CLICKED, data: operator })"
            :disabled="!state.can({ type: MachineEventTypes.OPERATOR_CLICKED, data: operator })"
        >
          {{ displaySign }}
        </button>
      </section>
    </div>
  </div>
</template>
