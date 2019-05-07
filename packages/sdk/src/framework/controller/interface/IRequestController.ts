/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';

interface IRequestController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> {
  get(id: IdType): Promise<T | null>;

  put(data: Partial<T>): Promise<T>;

  post(data: Partial<T>): Promise<T>;
}

export { IRequestController };
