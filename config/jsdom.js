/*
 * @Author: isaac.liu
 * @Date: 2019-07-24 16:33:29
 * Copyright © RingCentral. All rights reserved.
 */
const {
  JSDOM
} = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const {
  window
} = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};
copyProps(window, global);
