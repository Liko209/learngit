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

  hangUp = (callId: number) => {
    this.telephonyController.getAccountController().hangUp(callId);
  }

  mute = (callId: number) => {
    this.telephonyController.getAccountController().mute(callId);
  }

  unmute = (callId: number) => {
    this.telephonyController.getAccountController().unmute(callId);
  }

  hold = async (callId: number) => {
    return await this.telephonyController.getAccountController().hold(callId);
  }

  unhold = async (callId: number) => {
    return await this.telephonyController.getAccountController().unhold(callId);
  }

  startRecord = async (callId: number) => {
    return await this.telephonyController
      .getAccountController()
      .startRecord(callId);
  }

  stopRecord = async (callId: number) => {
    return await this.telephonyController
      .getAccountController()
      .stopRecord(callId);
  }

  dtmf = (callId: number, digits: string) => {
    this.telephonyController.getAccountController().dtmf(callId, digits);
  }

  answer = (callId: number) => {
    this.telephonyController.getAccountController().answer(callId);
  }

  sendToVoiceMail = (callId: number) => {
    this.telephonyController.getAccountController().sendToVoiceMail(callId);
  }

  ignore = (callId: number) => {
    this.telephonyController.getAccountController().ignore(callId);
  }

  startReply = (callId: number) => {
    this.telephonyController.getAccountController().startReply(callId);
  }

  replyWithMessage = (callId: number, message: string) => {
    this.telephonyController
      .getAccountController()
      .replyWithMessage(callId, message);
  }

  park = async (callId: number) => {
    return await this.telephonyController.getAccountController().park(callId);
  }

  flip = async (callId: number, flipNumber: number) => {
    return await this.telephonyController
      .getAccountController()
      .flip(callId, flipNumber);
  }

  forward = async (callId: number, phoneNumber: string) => {
    return await this.telephonyController
      .getAccountController()
      .forward(callId, phoneNumber);
  }

  replyWithPattern = (
    callId: number,
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    this.telephonyController
      .getAccountController()
      .replyWithPattern(callId, pattern, time, timeUnit);
  }

  getRingerDevicesList = () => {
    return this.telephonyController.getRingerDevicesList();
  }

  get phoneSetting() {
    if (!this._phoneSetting) {
      this._phoneSetting = new PhoneSetting(this);
    }
    return this._phoneSetting;
  }
}

export { TelephonyService };
