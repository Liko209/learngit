/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel, Raw } from '../../../models';

interface IEntitySourceController<T extends BaseModel = BaseModel> {
  getEntity(id: number): Promise<T | null>;

  getEntityLocally(id: number): Promise<T>;

  bulkUpdate(partialModels: Partial<Raw<T>>[]): Promise<void>;

  getEntitiesLocally(ids: number[], includeDeactivated: boolean): Promise<T[]>;

  getEntityNotificationKey(): string;
}

export { IEntitySourceController };
