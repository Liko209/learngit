/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-14-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntitySourceController } from './EntitySourceController';
import { BaseDao } from '../../dao';
import { RequestController } from './RequestController';
import { PartialModifyController } from './PartialModifyController';
import { BaseModel } from '../../models';

class ControllerBuilder {
  static buildEntitySourceController<T extends BaseModel = BaseModel>(
    dao: BaseDao<T>,
  ) {
    return new EntitySourceController<T>(dao, this.buildRequestController<T>());
  }

  static buildRequestController<T extends BaseModel = BaseModel>() {
    return new RequestController<T>();
  }

  static buildPartialModifyController<T extends BaseModel = BaseModel>(
    dao: BaseDao<T>,
  ) {
    return new PartialModifyController<T>(
      this.buildEntitySourceController<T>(dao),
    );
  }
}

export { ControllerBuilder };
