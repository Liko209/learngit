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
  create,
  convert,
} from '@storybook/theming';

import { ThemeProvider as JuiThemeProvider } from '../src/foundation/theme/index';
import './index.css';

const ThemeDecorator = storyFn => {
  return (
    <JuiThemeProvider themeName='light'>
      <ThemeProvider theme={convert(themes.light)}>
        <Global styles={createReset} />
        {storyFn()}
      </ThemeProvider>
    </JuiThemeProvider>
  );
};

addDecorator(ThemeDecorator);

function loadStories() {
  const req = require.context(
    '../src/components/Avatar',
    true,
    /\.story\.tsx?$/,
  );
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
