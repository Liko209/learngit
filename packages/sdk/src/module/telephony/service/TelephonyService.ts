/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyEngineController } from '../controller';

class TelephonyService extends EntityBaseService {
  private _telephonyEngineController: TelephonyEngineController;

  constructor() {
    super(false);
    this._init();
  }

  protected get telephonyController() {
    if (!this._telephonyEngineController) {
      this._telephonyEngineController = new TelephonyEngineController();
    }
    return this._telephonyEngineController;
  }

  private _init() {
    this.telephonyController.initEngine();
  }
}

export { TelephonyService };
