/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IEntityPersistentController } from './IEntityPersistentController';
import { IRequestController } from './IRequestController';

interface IEntitySourceController<T extends IdModel = IdModel>
  extends IEntityPersistentController<T> {
  getEntityLocally(id: number): Promise<T | null>;

  getEntitiesLocally(ids: number[], includeDeactivated: boolean): Promise<T[]>;

  getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]>;

  getRequestController(): IRequestController<T> | null;
}

export { IEntitySourceController };
