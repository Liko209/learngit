/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-12 17:37:44
 * @Last Modified by: Jeffery Huang
 * @Last Modified time: 2019-01-12 18:51:29
 */

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// @ts-ignore
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

configure({ adapter: new Adapter() });
