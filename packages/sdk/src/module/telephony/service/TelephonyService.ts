/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyEngineController } from '../controller';
import { ITelephonyCallDelegate } from './ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from './ITelephonyAccountDelegate';
import { MakeCallController } from '../controller/MakeCallController';
import { MAKE_CALL_ERROR_CODE } from '../types';

class TelephonyService extends EntityBaseService {
  private _telephonyEngineController: TelephonyEngineController;
  private _makeCallController: MakeCallController;

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
    this._makeCallController = new MakeCallController();
  }

  createAccount(delegate: ITelephonyAccountDelegate) {
    this.telephonyController.createAccount(delegate);
  }

  async makeCall(toNumber: string, callDelegate: ITelephonyCallDelegate) {
    const e164ToNumber = this._makeCallController.getE164PhoneNumber(toNumber);
    const errorCode = await this._makeCallController.tryMakeCall(e164ToNumber);
    if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
      return errorCode;
    }
    this.telephonyController
      .getAccountController()
      .makeCall(toNumber, callDelegate);
    return errorCode;
  }

  hangUp(callId: string) {
    this.telephonyController.getAccountController().hangUp(callId);
  }
}

export { TelephonyService };
