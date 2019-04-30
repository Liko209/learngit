/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IBaseQuery } from '../../../api/NetworkClient';

interface IRequestController<T extends IdModel = IdModel> {
  get(id: number, options?: Partial<IBaseQuery>): Promise<T | null>;

  put(data: Partial<T>, options?: Partial<IBaseQuery>): Promise<T>;

  post(data: Partial<T>, options?: Partial<IBaseQuery>): Promise<T>;
}

export { IRequestController };
