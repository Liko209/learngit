/*
 * @Author: isaac.liu
 * @Date: 2019-07-26 09:13:22
 * Copyright © RingCentral. All rights reserved.
 */
// Array.prototype.flatMap
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';

require('core-js/features/array/flat-map');
require('reflect-metadata');

const btoa = require('btoa');
const FormData = require('form-data');
const fetch = require('jest-fetch-mock');
const {
  copyProps,
  FakeStorage
} = require('../utils');
const {
  performance
} = require('perf_hooks');

registerRequireContextHook();

const location = {
  origin: '',
};

const window = {
  URL,
  Promise,
  btoa,
  FormData,
  performance,
  location,
  setTimeout,
  clearTimeout,
  console,
  fetch,
  Reflect,
  localStorage: new FakeStorage(),
  sessionStorage: new FakeStorage(),
  addEventListener: () => {},
  history: {},
};

const document = {
  addEventListener: () => {},
  createElement: () => {},
  querySelectorAll: () => [],
  getElementById: () => null
};

window.navigator = {
  userAgent: 'node',
  platform: 'Mac',
  onLine: true,
};
global.document = document;
global.window = window;

copyProps(window, global);
