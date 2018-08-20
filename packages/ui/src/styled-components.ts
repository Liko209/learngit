/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 12:19:55
 * Copyright © RingCentral. All rights reserved
 *
 * An official way to wrap styled-components in typescript.
 * See: https://www.styled-components.com/docs/api#typescript
 */
// Fix error TS4023: Exported variable 'ThemeProvider' has or is using name 'React.ComponentClass'
// from external module "Fiji/node_modules/@types/react/index" but cannot be named.
// See: https://github.com/styled-components/styled-components/issues/1847
import { ComponentClass } from 'react';

import * as styledComponents from 'styled-components';
import { Theme } from './theme';

const {
  default: styled,
  css,
  injectGlobal,
  keyframes,
  ThemeProvider,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<Theme>;

export { css, injectGlobal, keyframes, ThemeProvider, ComponentClass };
export default styled;
