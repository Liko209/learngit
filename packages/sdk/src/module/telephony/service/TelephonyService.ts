/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyController } from '../controller';

class TelephonyService extends EntityBaseService {
  private _telephonyController: TelephonyController;

  constructor() {
    super();
    this._init();
  }

  protected get telephonyController() {
    if (!this._telephonyController) {
      this._telephonyController = new TelephonyController(
        this.getControllerBuilder(),
      );
    }
    return this._telephonyController;
  }

  private _init() {
    this.telephonyController.initEngine();
  }
}

export { TelephonyService };
