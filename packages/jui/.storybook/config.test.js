/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  storiesOf,
  configure,
  addDecorator,
  addParameters,
} from '@storybook/react';
import {
  Global,
  ThemeProvider,
  themes,
  createReset,
  convert,
} from '@storybook/theming';

import { ThemeProvider as JuiThemeProvider } from '../src/foundation/theme/index';
import './index.css';

const ThemeDecorator = storyFn => {
  return (
    <JuiThemeProvider themeName='light'>
      <ThemeProvider theme={convert(themes.light)}>{storyFn()}</ThemeProvider>
    </JuiThemeProvider>
  );
};

// this decorator is used in storyshots.test.jsx not storyImageShots.test.jsx
addDecorator(ThemeDecorator);

addParameters({
  info: {
    disable: true,
  },
});

// this req is used in both storyshots.test.jsx and storyImageShots.test.jsx
const req = require.context('../src', true, /\.story\.tsx?$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
