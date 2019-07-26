/*
 * @Author: isaac.liu
 * @Date: 2019-07-26 09:13:22
 * Copyright © RingCentral. All rights reserved.
 */
// Array.prototype.flatMap
require("core-js/features/array/flat-map");
require("reflect-metadata");

const btoa = require('btoa');
const FormData = require('form-data');
const fetch = require('jest-fetch-mock');
const {
  copyProps,
  FakeStorage
} = require('../utils');
const {
  performance,
} = require('perf_hooks');


const location = {
  origin: ''
}

const window = {
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
  addEventListener: () => {}
};

const document = {
  addEventListener: () => {}
}

window.navigator = {
  userAgent: 'node',
  platform: 'Mac',
  onLine: true
};
global.document = document;
global.window = window;

copyProps(window, global);
