/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import '@babel/polyfill';
import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

import { ThemeProvider } from '../src/foundation/theme/index';
import './index.css';

const ThemeDecorator = storyFn => {
  return (
    <ThemeProvider themeName='light'>
      <div style={{ paddingTop: '25px' }}>{storyFn()}</div>
    </ThemeProvider>
  );
};

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(requireAll(require.context('../src', true, /\.story\.tsx?$/)));
}

addDecorator(withKnobs);
addDecorator(ThemeDecorator);

configure(loadStories, module);
