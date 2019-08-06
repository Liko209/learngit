import Dexie from 'dexie';

export class Setup {
  static init() {
    // require('core-js/modules/es6.typed.array-buffer');
    Dexie.dependencies.indexedDB = require('fake-indexeddb');
    Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
  }
}
