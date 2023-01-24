import { createApp } from 'vue';
import App from './App.vue';
import { inspect } from '@xstate/inspect';
import './index.css'

inspect({
  iframe: false,
})
createApp(App).mount('#app')
