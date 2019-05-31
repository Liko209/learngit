/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:56
 * Copyright © RingCentral. All rights reserved.
 */
'use strict';
if (process.env.NODE_ENV === 'test') {
  // Mobx UT setup
  const mobx = require('mobx');
  const _configure = mobx.configure;
  mobx.configure = options =>
    _configure(
      Object.assign({}, options, {
        computedRequiresReaction: false,
      }),
    );
  mobx.configure();

  const moment = require('moment-timezone');
  moment.tz.setDefault('Asia/Shanghai');
  // In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
  // We don't polyfill it in the browser--this is user's responsibility.
  require('raf').polyfill(global);

  // Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
  // Make IDBKeyRange global so your code can create key ranges.
  Object.defineProperty(window, 'indexedDB', {
    value: require('fake-indexeddb'),
  });
  Object.defineProperty(window, 'IDBKeyRange', {
    value: require('fake-indexeddb/lib/FDBKeyRange'),
  });

  // Create a localStorage and sessionStorage at window
  class FakeStorage {
    store = {};
    getItem(key) {
      return this.store[key] || null;
    }
    setItem(key, value) {
      this.store[key] = value.toString();
    }
    removeItem(key) {
      delete this.store[key];
    }
    clear() {
      this.store = {};
    }
    get length() {
      return Object.keys(this.store).length;
    }
  }

  Object.defineProperty(window, 'localStorage', {
    value: new FakeStorage(),
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: new FakeStorage(),
  });

  // mock console for jest
  // global.console = {
  //   assert: jest.fn(),
  //   clear: jest.fn(),
  //   context: jest.fn(),
  //   count: jest.fn(),
  //   countReset: jest.fn(),
  //   debug: jest.fn(),
  //   error: jest.fn(),
  //   group: jest.fn(),
  //   groupCollapsed: jest.fn(),
  //   groupEnd: jest.fn(),
  //   info: jest.fn(),
  //   log: jest.fn(),
  //   time: jest.fn(),
  //   timeEnd: jest.fn(),
  //   timeLog: jest.fn(),
  //   timeStamp: jest.fn(),
  //   trace: jest.fn(),
  //   warn: jest.fn(),
  // };

  global.fetch = require('jest-fetch-mock');
}

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason;
  });
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
}
