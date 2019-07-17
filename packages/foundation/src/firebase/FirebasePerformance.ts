/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 09:36:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as firebase from 'firebase/app';
import { firebaseConfigProEnv } from './types';

class FirebasePerformance {
  private static _instance: FirebasePerformance;
  private _performance: firebase.performance.Performance;

  static getInstance() {
    if (!this._instance) {
      this._instance = new FirebasePerformance();
    }
    return this._instance;
  }

  initialize() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfigProEnv);
    this._performance = firebase.performance();
    // Add the Performance Monitoring library
    import('firebase/performance');
  }

  getPerformance() {
    return this._performance;
  }
}

export { FirebasePerformance };
