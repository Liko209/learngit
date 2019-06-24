/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-21 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'React';
import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withThemeProvider } from '../src/storybook/decorators';
import JssProvider from 'react-jss/lib/JssProvider';
import '../src/storybook/index.css';

addDecorator(withKnobs);
addDecorator(withThemeProvider);

const generateClassName = (rule, styleSheet) =>
  `${styleSheet.options.classNamePrefix}-${rule.key}`;
addDecorator(story => (
  <JssProvider generateClassName={generateClassName}>{story()}</JssProvider>
));

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(require.context('../src', true, /\.story\.tsx?$/));
}

configure(loadStories, module);
