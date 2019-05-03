/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-17 15:05:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IDao } from '../../dao';

interface IEntityPersistentController<T extends IdModel = IdModel>
  extends IDao<T> {
  getEntityNotificationKey(): string;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  saveToMemory?: (entities: T[]) => void;
}

export { IEntityPersistentController };
