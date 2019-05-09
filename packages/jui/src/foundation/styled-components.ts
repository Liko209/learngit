/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-30 10:30:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as styledComponents from 'rcui/foundation/styled-components';
import {
  ThemedStyledComponentsModule,
  ThemeProps as StyledThemeProps,
} from 'styled-components'; // tslint:disable-line

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
type ThemeProps = StyledThemeProps<Theme>;

export {
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
  withTheme,
  ThemeConsumer,
  ThemeProps,
  Dependencies,
};

export default styled;
