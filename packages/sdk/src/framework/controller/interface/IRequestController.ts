/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel } from '../../../models';

interface IRequestController<T extends BaseModel = BaseModel> {
  get(id: number): Promise<T | null>;

  put(data: Partial<T>): Promise<T>;

  post(data: Partial<T>): Promise<T>;
}

export { IRequestController };
