/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-02 15:21:17
 * Copyright © RingCentral. All rights reserved.
 */

import { ISubItemService } from '../module/base/service/ISubItemService';
import { SubItemServiceRegister } from '../config';

class ItemServiceController {
  private _subItemServices: Map<number, ISubItemService>;

  constructor() {
    this._subItemServices = SubItemServiceRegister.buildSubItemServices();
  }

  getSubItemService(typeId: number) {
    return this._subItemServices.get(typeId);
  }
}

export { ItemServiceController };
