/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 12:19:55
 * Copyright © RingCentral. All rights reserved
 *
 * An official way to wrap styled-components in typescript.
 * See: https://www.styled-components.com/docs/api#typescript
 */
import * as styledComponents from 'styled-components';
import { ThemeOptions } from './theme';

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<ThemeOptions>;

export { css, injectGlobal, keyframes, ThemeProvider };
export default styled;
