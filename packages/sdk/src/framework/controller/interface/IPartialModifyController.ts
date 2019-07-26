/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw, ModelIdType } from '../../model';

type PartialNotifyFunc<T> = (
  originalEntities: T[],
  updatedEntities: T[],
  partialEntities: Partial<Raw<T>>[],
) => void;

type PreHandlePartialEntityFunc<T> = (
  partialEntity: Partial<Raw<T>>,
  originalEntity: T,
) => Partial<Raw<T>>;

type UpdateEntityFunc<T> = (updatedEntity: T) => Promise<T>;

type PartialUpdateParams<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> = {
  entityId: IdType;
  preHandlePartialEntity?: PreHandlePartialEntityFunc<T>;
  doUpdateEntity?: UpdateEntityFunc<T>;
  doPartialNotify?: PartialNotifyFunc<T>;
  saveLocalFirst?: boolean;
};

interface IPartialModifyController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> {
  updatePartially(params: PartialUpdateParams<T, IdType>): Promise<T | null>;

  getRollbackPartialEntity(
    partialEntity: Partial<Raw<T>>,
    originalEntity: T,
  ): Partial<Raw<T>>;

  getMergedEntity(partialEntity: Partial<Raw<T>>, originalEntity: T): T;
}

export {
  IPartialModifyController,
  PartialUpdateParams,
  PartialNotifyFunc,
  PreHandlePartialEntityFunc,
  UpdateEntityFunc,
};
