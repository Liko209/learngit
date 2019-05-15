/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-12 17:50:45
 * @Last Modified by: wayne.zhou
 * @Last Modified time: 2019-05-14 13:21:55
 */
require('raf').polyfill(global);

// polyfill require.context
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
registerRequireContextHook();
