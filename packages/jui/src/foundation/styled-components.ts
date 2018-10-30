/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-30 10:30:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as styledComponents from 'styled-components';
import { ThemedStyledComponentsModule } from "styled-components"; // tslint:disable-line

import { Theme } from './theme/theme';

const {
  default: styled,
  css,
  keyframes,
  createGlobalStyle,
  withTheme,
  ThemeProvider,
  ThemeConsumer,
} = styledComponents as ThemedStyledComponentsModule<Theme>;

type Dependencies = {
  dependencies?: (React.ComponentType | ((props: any) => JSX.Element))[];
};

export {
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
  withTheme,
  ThemeConsumer,
  Dependencies,
};
export default styled;
