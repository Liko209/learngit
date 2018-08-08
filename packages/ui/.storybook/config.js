import React from 'react';
import { configure, setAddon, addDecorator } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import { withKnobs } from '@storybook/addon-knobs/react';
import { withInfo } from '@storybook/addon-info';
import '@storybook/addon-console';

import { ThemeProvider, createTheme } from '../src/theme/index';

const theme = createTheme();

const ThemeDecorator = storyFn => (
  <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>
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
