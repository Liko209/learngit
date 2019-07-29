/*
 * @Author: wayne.zhou
 * @Date: 2019-05-08 23:01:16
 * Copyright © RingCentral. All rights reserved.
 */
import './jest/setup/setupConsole';
import './jest/setup/setupHTMLElement';
import './jest/setup/setupTimezone';
import './jest/setup/setupMobx';
import './jest/setup/setupStyledTheme';
import {
  FakeStorage
} from './utils';
/* eslint-disable */

const log = (reason) => {
  throw reason;
};

beforeAll(() => {

  if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', log);
    // Avoid memory leak by adding too many listeners
    process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
  }

  Object.defineProperty(window, 'localStorage', {
    value: new FakeStorage(),
    writable: true
  })
  Object.defineProperty(window, 'sessionStorage', {
    value: new FakeStorage(),
    writable: true
  })
})

afterAll(() => {
  delete window.localStorage;
  delete window.sessionStorage;

  process.off('unhandledRejection', log);
  process.env.LISTENING_TO_UNHANDLED_REJECTION = false;

  global.gc();
})
