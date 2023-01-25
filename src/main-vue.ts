import { createApp } from 'vue';
// @ts-ignore
import App from './App.vue';
import { inspect } from '@xstate/inspect';
import './index.css'

inspect({
  iframe: false,
});

createApp(App).mount('#app')
