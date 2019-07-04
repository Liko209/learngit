/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:56
 * Copyright © RingCentral. All rights reserved.
 */
'use strict';

if (process.env.NODE_ENV === 'test') {
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
  Object.defineProperty(window, 'IDBIndex', {
    value: require('fake-indexeddb/lib/FDBIndex'),
  });
  Object.defineProperty(window, 'IDBCursor', {
    value: require('fake-indexeddb/lib/FDBCursor'),
  });
  Object.defineProperty(window, 'IDBObjectStore', {
    value: require('fake-indexeddb/lib/FDBObjectStore'),
  });
  Object.defineProperty(window, 'IDBTransaction', {
    value: require('fake-indexeddb/lib/FDBTransaction'),
  });
  Object.defineProperty(window, 'IDBDatabase', {
    value: require('fake-indexeddb/lib/FDBDatabase'),
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

  global.fetch = require('jest-fetch-mock');

  global.Notification = {
    requestPermission: jest.fn(),
    permission: 'default',
  };
}

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  // process.on('unhandledRejection', reason => {
  //   throw reason;
  // });
  // // Avoid memory leak by adding too many listeners
  // process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
}

// polyfill require.context
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
registerRequireContextHook();
