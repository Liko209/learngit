/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-14-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel, Raw } from '../../models';
import { Api } from '../../api';
import { ErrorHandlingController } from './ErrorHandlingController';
import { ApiResult } from '../../api/ApiResult';
import { transform } from '../../service/utils';

class RequestController<T extends BaseModel = BaseModel> {
  constructor() {}
  async requestDataById(id: number): Promise<T | null> {
    if (id <= 0) {
      const error = new ErrorHandlingController();
      error.throwInvalidParameterError('id', id);
    }
    const result: ApiResult<any> = await Api.getDataById<T>(id);
    if (result.isOk()) {
      const arr: T[] = []
        .concat(result.data)
        .map((item: Raw<T>) => transform(item));
      return arr.length > 0 ? arr[0] : null;
    }
    return null;
  }
}

export { RequestController };
