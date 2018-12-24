/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel, Raw } from '../../../models';

interface IPartialModifyController<T extends BaseModel = BaseModel> {
  updatePartially(
    entityId: number,
    preHandlePartialEntity?: (
      partialEntity: Partial<Raw<T>>,
      originalEntity: T,
    ) => Partial<Raw<T>>,
    doUpdateEntity?: (updatedEntity: T) => Promise<T>,
    doPartialNotify?: (
      originalEntities: T[],
      updatedEntities: T[],
      partialEntities: Partial<Raw<T>>[],
    ) => void,
  ): Promise<T | null>;

  getRollbackPartialEntity(
    partialEntity: Partial<Raw<T>>,
    originalEntity: T,
  ): Partial<Raw<T>>;

  getMergedEntity(partialEntity: Partial<Raw<T>>, originalEntity: T): T;
}

export { IPartialModifyController };
