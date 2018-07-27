/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-03 15:13:21
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-05-08 19:28:33
 */
import createTheme from 'styled-components-theme';
import ThemeProvider from './ThemeProvider';

import { common } from './theme';

const styledTheme = createTheme(...common);

export default ThemeProvider;

export { styledTheme };
