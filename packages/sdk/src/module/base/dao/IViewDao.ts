/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-08-14 13:07:46
 * Copyright © RingCentral. All rights reserved.
 */

import { IDao } from 'sdk/dao';
import { ModelIdType, IdModel } from 'sdk/framework/model';
import { IDatabaseCollection } from 'foundation/db';

interface IViewDao<
  IdType extends ModelIdType = number,
  K extends IdModel<IdType> = IdModel<IdType>, // K is the original entity
  T extends IdModel<IdType> = IdModel<IdType>
> extends IDao<T, IdType> {
  toViewItem(entity: K): T;
  toPartialViewItem(partialEntity: Partial<K>): Partial<T>;
  getCollection: () => IDatabaseCollection<T, IdType>;
}

export { IViewDao };
