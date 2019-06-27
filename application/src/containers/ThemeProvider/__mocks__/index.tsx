/*
 * @Author: isaac.liu
 * @Date: 2019-06-27 14:46:48
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { defaultTheme } from 'shield/utils';
import { ThemeProvider as SP } from 'styled-components';

const ThemeProvider = (props: any) => (
  <SP theme={defaultTheme}>{props.children}</SP>
);

export default ThemeProvider;
