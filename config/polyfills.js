/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:42:56
 * Copyright © RingCentral. All rights reserved.
 */
'use strict';
if (process.env.NODE_ENV === 'test') {
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

  Object.defineProperty(window, "localStorage", {
    value: new FakeStorage()
  });

  Object.defineProperty(window, "sessionStorage", {
    value: new FakeStorage()
  });

  // to fix: wait for enzyme to support memo
  const React = require("react");
  React.memo = x => x;
}
