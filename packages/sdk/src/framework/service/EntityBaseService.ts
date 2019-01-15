/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from './AbstractService';
import { IdModel } from '../model';
import { ControllerBuilder } from '../controller/impl/ControllerBuilder';
import { container } from '../../container';
import { ISubscribeController } from '../controller/interface/ISubscribeController';
import { IEntitySourceController } from '../controller/interface/IEntitySourceController';

class EntityBaseService<T extends IdModel = IdModel> extends AbstractService {
  private _subscribeController: ISubscribeController;
  private entitySourceController: IEntitySourceController<T>;
  constructor() {
    super();
  }

  setEntitySource(sourceController: IEntitySourceController<T>) {
    this.entitySourceController = sourceController;
  }

  setSubscriptionController(subscribeController: ISubscribeController) {
    this._subscribeController = subscribeController;
  }

  protected onStarted() {
    if (this._subscribeController) {
      this._subscribeController.subscribe();
    }
  }
  protected onStopped() {
    if (this._subscribeController) {
      this._subscribeController.unsubscribe();
    }
  }

  getById(id: number): Promise<T | null> {
    if (this.entitySourceController) {
      return Promise.resolve(this.entitySourceController.getEntity(id));
    }
    throw new Error('entitySourceController is null');
  }

  getControllerBuilder() {
    return new ControllerBuilder<T>();
  }

  static getInstance<T extends EntityBaseService<any>>(): T {
    return container.get(this.name);
  }
}

export { EntityBaseService };
