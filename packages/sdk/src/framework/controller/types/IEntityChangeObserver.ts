/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-10 18:09:33
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model/Model';
interface IEntityChangeObserver<T extends IdModel<ModelIdType> = IdModel> {
  onEntitiesChanged(entities: T[]): void;
}

export { IEntityChangeObserver };
