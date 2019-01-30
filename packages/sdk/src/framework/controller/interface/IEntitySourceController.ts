/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IEntityPersistentController } from './IEntityPersistentController';

interface IEntitySourceController<T extends IdModel = IdModel>
  extends IEntityPersistentController<T> {
  get(id: number): Promise<T | null>;

  getEntityLocally(id: number): Promise<T>;

  getEntitiesLocally(ids: number[], includeDeactivated: boolean): Promise<T[]>;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;
}

export { IEntitySourceController };
