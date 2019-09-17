/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-09 15:58:24
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, ModelIdType } from '../../model';
import { IEntityChangeObserver } from '../types';

interface IEntityNotificationController<
  T extends IdModel<ModelIdType> = IdModel
> {
  setFilterFunc(filterFunc: (entity: T) => boolean): void;
  addObserver(observer: IEntityChangeObserver<T>): void;
  removeObserver(observer: IEntityChangeObserver<T>): void;
  onReceivedNotification(entities: T[]): void;
}

export { IEntityNotificationController };
