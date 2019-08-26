/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-21 15:10:30
 * Copyright © RingCentral. All rights reserved.
 */

import { FetchSortableDataListHandler } from '@/store/base';
import { IdModel } from 'sdk/framework/model';

abstract class IdModelFocHandler {
  private _foc: FetchSortableDataListHandler<IdModel>;

  protected abstract createFoc(): FetchSortableDataListHandler<IdModel>;

  getFoc() {
    if (!this._foc) {
      this._foc = this.createFoc();
    }
    return this._foc;
  }

  dispose() {
    if (this._foc) {
      this._foc.dispose();
    }
  }
}

export { IdModelFocHandler };
