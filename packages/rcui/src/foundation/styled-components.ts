import * as styledComponents from 'styled-components';
import {
  ThemedStyledComponentsModule,
  ThemeProps as StyledThemeProps,
} from "styled-components"; // tslint:disable-line

import { Theme } from './styles';

const {
  default: styled,
  css,
  keyframes,
  createGlobalStyle,
  withTheme,
  ThemeProvider,
  ThemeConsumer,
} = styledComponents as ThemedStyledComponentsModule<Theme>;

type ThemeProps = StyledThemeProps<Theme>;

export {
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
  withTheme,
  ThemeConsumer,
  ThemeProps,
};

export default styled;
