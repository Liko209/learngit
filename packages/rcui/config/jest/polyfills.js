/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-12 17:50:45
 * @Last Modified by:
 * @Last Modified time: 2019-06-24 16:03:21
 */
require('raf').polyfill(global);

// polyfill require.context
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
registerRequireContextHook();

// todo: after icon solution changed, remove this polyfill
global.fetch = () =>
  Promise.resolve({
    text: () => Promise.resolve(''),
  });
