/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';

interface IPartialEntitySourceController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> {
  get: (id: IdType) => Promise<T | null>;
  update: (item: T) => Promise<void>;
  getEntityNotificationKey: () => string;
}

export { IPartialEntitySourceController };
