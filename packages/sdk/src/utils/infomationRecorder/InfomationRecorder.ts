/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 10:31:26
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractRecord } from './AbstractRecord';
import { Nullable } from 'sdk/types';

export class InformationRecorder<R> {
  private _lastRecord: Nullable<AbstractRecord<R>>;

  private _currentRecord: Nullable<AbstractRecord<R>>;

  private _isInTransaction: boolean = false;

  constructor(
    private _creator: () => AbstractRecord<R>,
    private _onTransactionEnd?: () => void,
  ) {}

  private _ensureInTransaction() {
    if (!this._isInTransaction) {
      this.startTransaction();
    }
  }

  startTransaction() {
    if (this._isInTransaction) {
      this.endTransaction();
    }
    this._isInTransaction = true;
    this._currentRecord = this._creator();
  }

  endTransaction() {
    this._isInTransaction = false;
    this._lastRecord = this._currentRecord;
    this._currentRecord = null;
    this._onTransactionEnd && this._onTransactionEnd();
  }

  getLastRecord() {
    return this._lastRecord ? this._lastRecord.getRecord() : null;
  }

  getCurrentRecord() {
    return this._currentRecord ? this._currentRecord.getRecord() : null;
  }

  set<K extends keyof R>(
    key: K,
    property: R[K],
    addible: boolean = true,
  ): this {
    this._ensureInTransaction();
    this._currentRecord!.setProperty(key, property, addible);
    return this;
  }
}
