import Dexie from 'dexie';

export class DexieTester {
  static setup() {
    // require('core-js/modules/es6.typed.array-buffer');
    Dexie.dependencies.indexedDB = require('fake-indexeddb');
    Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
  }
}
