/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { configure, addDecorator, addParameters } from '@storybook/react';
import { ThemeProvider, themes, convert } from '@storybook/theming';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { createMuiTheme } from '@material-ui/core/styles';
import JssProvider from 'react-jss/lib/JssProvider';
import { rawTheme } from './theme';

const generateClassName = (rule, styleSheet) =>
  `${styleSheet.options.classNamePrefix}-${rule.key}`;

const theme = createMuiTheme(rawTheme);

const ThemeDecorator = storyFn => {
  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <ThemeProvider theme={convert(themes.light)}>{storyFn()}</ThemeProvider>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
};

// this decorator is used in storyshots.test.jsx not storyImageShots.test.jsx
addDecorator(ThemeDecorator);
addDecorator(story => (
  <JssProvider generateClassName={generateClassName}>{story()}</JssProvider>
));

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
