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
  private _attrs: Map<string, { attr: string; value: string }> = new Map<
    string,
    { attr: string; value: string }
  >();

  async initialize() {
    const storageManager = new KVStorageManager();
    if (window.indexedDB && storageManager.isLocalStorageSupported()) {
      await this.initializeFirebase();
    }
  }

  getAttribute(attr: string): { attr: string; value: string } | undefined {
    return this._attrs.get(attr);
  }

  putAttribute(attr: string, value: string): void {
    this._attrs.set(attr, { attr, value });
  }

  removeAttribute(attr: string): void {
    this._attrs.delete(attr);
  }

  getTracer(traceName: string) {
    const tracer = new Tracer(
      this._performance && this._performance.trace(traceName),
    );

    const allAttrs = Array.from(this._attrs.values());
    allAttrs.forEach(attr => {
      tracer.putAttribute(attr.attr, attr.value);
    });

    return tracer;
  }

  protected async initializeFirebase() {
    await import('firebase/performance');
    // Initialize Firebase
    firebase.initializeApp(firebaseConfigProEnv);
    this._performance = firebase.performance();
  }
}

export { FirebasePerformance };
