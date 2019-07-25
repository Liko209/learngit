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
/* eslint-disable */

const log = (reason) => {
  throw reason;
};

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

const Dexie = require('dexie');

beforeAll(() => {
  // Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
  // Make IDBKeyRange global so your code can create key ranges.
  Dexie.dependencies.indexedDB = require('fake-indexeddb');
  Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

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
  delete Dexie.dependencies.indexedDB;
  delete Dexie.dependencies.IDBKeyRange;

  delete window.localStorage;
  delete window.sessionStorage;

  process.off('unhandledRejection', log);
  process.env.LISTENING_TO_UNHANDLED_REJECTION = false;
})
