/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 10:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from './AbstractService';
import { BaseModel } from '../../models';
import { ControllerFactory } from '../controller/ControllerFactory';

class EntityBaseService<
  T extends BaseModel = BaseModel
> extends AbstractService {
  constructor() {
    super();
  }
  protected onStarted() {}
  protected onStopped() {}

  getControllerBuilder() {
    return ControllerFactory.getControllerBuilder<T>();
  }
}

export { EntityBaseService };
