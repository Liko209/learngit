/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 09:36:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as firebase from 'firebase/app';
import { firebaseConfigProEnv } from './types';
import { Tracer } from '../../base/Tracer';
import { IPerformance } from '../../base/IPerformance';
import { KVStorageManager } from '../../../db';

class FirebasePerformance implements IPerformance {
  private _performance: firebase.performance.Performance | null;

  async initialize() {
    const storageManager = new KVStorageManager();
    if (window.indexedDB && storageManager.isLocalStorageSupported()) {
      await this.initializeFirebase();
    }
  }

  getTracer(traceName: string) {
    return new Tracer(this._performance && this._performance.trace(traceName));
  }

  protected async initializeFirebase() {
    await import('firebase/performance');
    // Initialize Firebase
    firebase.initializeApp(firebaseConfigProEnv);
    this._performance = firebase.performance();
  }
}

export { FirebasePerformance };
