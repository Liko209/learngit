/*
 * @Author: isaac.liu
 * @Date: 2019-07-24 16:33:29
 * Copyright © RingCentral. All rights reserved.
 */
const {
  JSDOM
} = require('jsdom');
const {
  copyProps
} = require('./utils');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {
  window
} = jsdom;

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'jsdom',
};
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};
copyProps(window, global);
