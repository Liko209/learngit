/*
 * @Author: wayne.zhou
 * @Date: 2019-05-08 23:01:16
 * Copyright © RingCentral. All rights reserved.
 */
import './jest/setup/console';
import './jest/setup/emoji';
import './jest/setup/timezone';
import './jest/setup/mobx';
import './jest/setup/styledTheme';
import './jest/setup/media';
import './jest/setup/selection';
import './jest/setup/promise';
import './jest/setup/thirdParty';
import * as setupTimer from './jest/setup/timer';
import {
  FakeStorage
} from './utils';
/* eslint-disable */
jest.mock('styled-components', () => require('./jest/setup/styled-components'));

const log = reason => {
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
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: new FakeStorage(),
    writable: true,
  });
});

afterAll(() => {
  delete window.localStorage;
  delete window.sessionStorage;
  delete window.logger;
  setupTimer.tearDown();

  process.off('unhandledRejection', log);
  process.env.LISTENING_TO_UNHANDLED_REJECTION = false;
  global.gc && global.gc();
});
