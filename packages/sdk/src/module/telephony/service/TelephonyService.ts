/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyEngineController } from '../controller';
import {
  ITelephonyCallDelegate,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from './ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from './ITelephonyAccountDelegate';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SERVICE } from '../../../service/eventKey';
import { MAKE_CALL_ERROR_CODE } from '../types';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { Call } from '../entity';

class TelephonyService extends EntityBaseService<Call> {
  private _telephonyEngineController: TelephonyEngineController;
  private _userConfig: TelephonyUserConfig;

  constructor() {
    super({ isSupportedCache: true, entityName: 'CALL' });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGOUT]: this.handleLogOut,
      }),
    );
    this._init();
  }

  handleLogOut = async () => {
    this.telephonyController.logout();
  }

  protected get telephonyController() {
    if (!this._telephonyEngineController) {
      this._telephonyEngineController = new TelephonyEngineController(
        this.userConfig,
      );
    }
    return this._telephonyEngineController;
  }

  private _init() {
    this.telephonyController.initEngine();
  }

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new TelephonyUserConfig();
    }
    return this._userConfig;
  }

  createAccount = (
    accountDelegate: ITelephonyAccountDelegate,
    callDelegate: ITelephonyCallDelegate,
  ) => {
    this.telephonyController.createAccount(accountDelegate, callDelegate);
    this.telephonyController
      .getAccountController()
      .setDependentController(this.getEntityCacheController());
  }

  getAllCallCount = () => {
    const accountController = this.telephonyController.getAccountController();
    return accountController ? accountController.getCallCount() : 0;
  }

  makeCall = async (toNumber: string, fromNumber: string) => {
    const accountController = this.telephonyController.getAccountController();
    if (accountController) {
      return this.telephonyController
        .getAccountController()
        .makeCall(toNumber, fromNumber);
    }
    return MAKE_CALL_ERROR_CODE.INVALID_STATE;
  }

  hangUp = (callId: string) => {
    this.telephonyController.getAccountController().hangUp(callId);
  }

  mute = (callId: string) => {
    this.telephonyController.getAccountController().mute(callId);
  }

  unmute = (callId: string) => {
    this.telephonyController.getAccountController().unmute(callId);
  }

  hold = (callId: string) => {
    this.telephonyController.getAccountController().hold(callId);
  }

  unhold = (callId: string) => {
    this.telephonyController.getAccountController().unhold(callId);
  }

  startRecord = (callId: string) => {
    this.telephonyController.getAccountController().startRecord(callId);
  }

  stopRecord = (callId: string) => {
    this.telephonyController.getAccountController().stopRecord(callId);
  }

  dtmf = (callId: string, digits: string) => {
    this.telephonyController.getAccountController().dtmf(callId, digits);
  }

  answer = (callId: string) => {
    this.telephonyController.getAccountController().answer(callId);
  }

  sendToVoiceMail = (callId: string) => {
    this.telephonyController.getAccountController().sendToVoiceMail(callId);
  }

  ignore = (callId: string) => {
    this.telephonyController.getAccountController().ignore(callId);
  }

  startReply = (callId: string) => {
    this.telephonyController.getAccountController().startReply(callId);
  }

  replyWithMessage = (callId: string, message: string) => {
    this.telephonyController
      .getAccountController()
      .replyWithMessage(callId, message);
  }

  park = async (callId: string) => {
    return await this.telephonyController.getAccountController().park(callId);
  }

  flip = async (callId: string, flipNumber: number) => {
    return await this.telephonyController
      .getAccountController()
      .flip(callId, flipNumber);
  }

  forward = async (callId: string, phoneNumber: string) => {
    return await this.telephonyController
      .getAccountController()
      .forward(callId, phoneNumber);
  }

  replyWithPattern = (
    callId: string,
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    this.telephonyController
      .getAccountController()
      .replyWithPattern(callId, pattern, time, timeUnit);
  }

  getLastCalledNumber = () => {
    const accountController = this.telephonyController.getAccountController();
    return accountController ? accountController.getLastCalledNumber() : '';
  }
}

export { TelephonyService };
