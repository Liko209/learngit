import React from 'react';
import { defaultTheme } from '../utils/mountWithTheme';
import { ThemeProvider as SP } from 'styled-components';

const ThemeProvider = (props: any) => (
  <SP theme={defaultTheme}>{props.children}</SP>
);

export default ThemeProvider;
