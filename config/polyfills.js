/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:56
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
// Array.prototype.flatMap
import "core-js/features/array/flat-map";
// polyfill require.context
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';

registerRequireContextHook();

if (process.env.NODE_ENV === 'test') {
  // In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
  // We don't polyfill it in the browser--this is user's responsibility.
  require('raf').polyfill(global);

  global.fetch = require('jest-fetch-mock');
}
