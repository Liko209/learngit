/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';
import { IBaseQuery } from '../../../api/NetworkClient';

interface IRequestController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> {
  get(id: IdType, options?: Partial<IBaseQuery>): Promise<T | null>;

  put(data: Partial<T>, options?: Partial<IBaseQuery>): Promise<T>;

  post(data: Partial<T>, options?: Partial<IBaseQuery>): Promise<T>;
}

export { IRequestController };
