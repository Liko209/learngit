/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-03 15:14:15
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-05-08 19:29:01
 */
import React from 'react';
import PropTypes from 'prop-types';

import { ThemeProvider as PrimaryThemeProvider } from 'styled-components';

import * as themes from './theme';
import { THEME_TYPE } from './constants';

function ThemeProvider({ theme: { mode }, ...rest }) {
  const theme = themes[mode];

  return <PrimaryThemeProvider {...rest} theme={theme} />;
}

ThemeProvider.propTypes = {
  theme: PropTypes.shape({
    mode: PropTypes.oneOf(THEME_TYPE)
  })
};

ThemeProvider.defaultProps = {
  theme: { mode: THEME_TYPE[0] }
};

export default ThemeProvider;
