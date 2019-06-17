/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyEngineController } from '../controller';
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  ITelephonyDelegate,
} from './index';

import { SubscribeController } from '../../base/controller/SubscribeController';
import { SERVICE } from '../../../service/eventKey';
import { MAKE_CALL_ERROR_CODE } from '../types';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { Call } from '../entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SettingService } from 'sdk/module/setting';
import { PhoneSetting } from '../setting';
import { ITelephonyService } from './ITelephonyService';

class TelephonyService extends EntityBaseService<Call>
  implements ITelephonyService {
  private _telephonyEngineController: TelephonyEngineController;
  private _userConfig: TelephonyUserConfig;
  private _phoneSetting: PhoneSetting;

  constructor() {
    super({ isSupportedCache: true, entityName: 'CALL' });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGOUT]: this.handleLogOut,
      }),
    );
    this._init();
  }

  protected onStarted() {
    super.onStarted();
    this.telephonyController.createAccount();
    ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).registerModuleSetting(this.phoneSetting);
  }

  protected onStopped() {
    this.telephonyController.logout();
    super.onStopped();
    if (this._phoneSetting) {
      ServiceLoader.getInstance<SettingService>(
        ServiceConfig.SETTING_SERVICE,
      ).unRegisterModuleSetting(this._phoneSetting);
      delete this._phoneSetting;
    }
  }

  handleLogOut = async () => {
    this.telephonyController.logout();
  }

  getVoipCallPermission = async () => {
    return this.telephonyController.getVoipCallPermission();
  }

  protected get telephonyController() {
    if (!this._telephonyEngineController) {
      this._telephonyEngineController = new TelephonyEngineController(
        this.userConfig,
        this.getEntityCacheController(),
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

  setTelephonyDelegate = (accountDelegate: ITelephonyDelegate) => {
    this.telephonyController.setAccountDelegate(accountDelegate);
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

  hold = async (callId: string) => {
    return await this.telephonyController.getAccountController().hold(callId);
  }

  unhold = async (callId: string) => {
    return await this.telephonyController.getAccountController().unhold(callId);
  }

  startRecord = async (callId: string) => {
    return await this.telephonyController
      .getAccountController()
      .startRecord(callId);
  }

  stopRecord = async (callId: string) => {
    return await this.telephonyController
      .getAccountController()
      .stopRecord(callId);
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

  get phoneSetting() {
    if (!this._phoneSetting) {
      this._phoneSetting = new PhoneSetting(this);
    }
    return this._phoneSetting;
  }
}

export { TelephonyService };
