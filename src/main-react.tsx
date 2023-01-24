import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { inspect } from "@xstate/inspect";
import './index.css'

inspect({
    iframe: false,
    // url: 'https://xstate.js.org/viz',
    // url: 'https://stately.ai/viz?inspect',
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
