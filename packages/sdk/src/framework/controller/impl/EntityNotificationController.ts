/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-09 16:01:57
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { IdModel, ModelIdType } from '../../model';
import { IEntityChangeObserver } from '../types';
import { ObservableController } from '../impl/ObservableController';
import { IEntityNotificationController } from '../interface/IEntityNotificationController';

class EntityNotificationController<T extends IdModel<ModelIdType> = IdModel>
  extends ObservableController<IEntityChangeObserver<T>>
  implements IEntityNotificationController<T> {
  constructor(private _filterFunc?: (entity: T) => boolean) {
    super();
  }

  setFilterFunc(filterFunc?: (entity: T) => boolean) {
    this._filterFunc = filterFunc;
  }

  onReceivedNotification(entities: T[]) {
    if (this._observers.length && entities.length) {
      const needNotifiedEntities = this._filterFunc
        ? _.filter(entities, this._filterFunc)
        : entities;

      if (needNotifiedEntities.length) {
        this._observers.forEach((value: IEntityChangeObserver<T>) => {
          value.onEntitiesChanged(needNotifiedEntities);
        });
      }
    }
  }
}

export { EntityNotificationController };
