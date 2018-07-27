'use strict';

if (process.env.NODE_ENV === 'test') {
  // In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
  // We don't polyfill it in the browser--this is user's responsibility.
  require('raf').polyfill(global);

  // Create an IDBFactory at window.indexedDB so your code can use IndexedDB.
  // Make IDBKeyRange global so your code can create key ranges.
  Object.defineProperty(window, 'indexedDB', {
    value: require('fake-indexeddb')
  });
  Object.defineProperty(window, 'IDBKeyRange', {
    value: require('fake-indexeddb/lib/FDBKeyRange')
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
    value: new FakeStorage()
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: new FakeStorage()
  });
}
