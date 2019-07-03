/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-07-03 09:36:31
 * Copyright © RingCentral. All rights reserved.
 */

import * as firebase from 'firebase/app';
// Add the Performance Monitoring library
import 'firebase/performance';

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
    const firebaseConfig = {
      apiKey: 'AIzaSyAMEhBz7K7CNr1XFkBWh0xx8fzqc7omv6c',
      authDomain: 'jupiter-ca30a.firebaseapp.com',
      databaseURL: 'https://jupiter-ca30a.firebaseio.com',
      projectId: 'jupiter-ca30a',
      storageBucket: '',
      messagingSenderId: '939459062083',
      appId: '1:939459062083:web:3669766199ae04d7',
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    this._performance = firebase.performance();
  }

  getPerformance() {
    return this._performance;
  }
}

export { FirebasePerformance };
