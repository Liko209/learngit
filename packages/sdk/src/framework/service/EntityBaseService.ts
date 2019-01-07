/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from './AbstractService';
import { IdModel } from '../model';
import { ControllerBuilder } from '../controller/impl/ControllerBuilder';
import { container } from '../../container';

class EntityBaseService<
  T extends IdModel = IdModel
> extends AbstractService {
  constructor() {
    super();
  }
  protected onStarted() {}
  protected onStopped() {}

  getControllerBuilder() {
    return new ControllerBuilder<T>();
  }

  static getInstance<T extends EntityBaseService<any>>(): T {
    return container.get(this.name);
  }
}

export { EntityBaseService };
