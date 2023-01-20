import { inspect } from '@xstate/inspect';
import '../src/index.css';

inspect({
    iframe: false,
    // url: 'https://xstate.js.org/viz',
    // url: 'https://stately.ai/viz?inspect',
})
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
    (Story) => Story(),
];
