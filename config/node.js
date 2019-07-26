/*
 * @Author: isaac.liu
 * @Date: 2019-07-26 09:13:22
 * Copyright © RingCentral. All rights reserved.
 */
const btoa = require('btoa');
const FormData = require('form-data');
const {
  copyProps,
  FakeStorage
} = require('./utils');
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
  localStorage: new FakeStorage(),
  sessionStorage: new FakeStorage(),
  addEventListener: () => {}
};

const document = {
  addEventListener: () => {}
}

global.navigator = {
  userAgent: 'node',
};
global.document = document;
global.window = window;

copyProps(window, global);
