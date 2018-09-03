import React from 'react';
import { configure, setAddon, addDecorator } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import { withKnobs } from '@storybook/addon-knobs/react';
import '@storybook/addon-console';

import { ThemeProvider } from '../src/theme/index';

const ThemeDecorator = storyFn => (
  <ThemeProvider themeName="default">
    <div style={{ paddingTop: '25px' }}>{storyFn()}</div>
  </ThemeProvider>
);

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(require.context('../src', true, /\.story\.tsx?$/));
}

addDecorator(withKnobs);
addDecorator(ThemeDecorator);

setAddon(JSXAddon);

configure(loadStories, module);
