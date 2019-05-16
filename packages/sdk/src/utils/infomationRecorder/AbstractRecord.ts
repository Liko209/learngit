/*
 * @Author: Paynter Chen
 * @Date: 2019-05-16 10:31:22
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

export class AbstractRecord<R extends { logs?: any[] }> {
  constructor(private _record: Partial<R>) {}

  setProperty<K extends keyof R>(
    key: K,
    property: R[K],
    addible: boolean = true,
  ): this {
    if (_.isArray(this._record[key]) && addible) {
      this._record[key] = (_.concat(
        this._record[key],
        property,
      ) as any) as R[K];
    } else {
      this._record[key] = property;
    }
    return this;
  }

  addLogs(...params: any): this {
    this._record.logs = this._record.logs || [];
    this._record.logs = _.concat(this._record.logs, params);
    return this;
  }

  getRecord() {
    return this._record;
  }
}
