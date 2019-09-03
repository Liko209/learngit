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
import {
  MAKE_CALL_ERROR_CODE,
  notificationCallback,
  TelephonyDataCollectionInfoConfigType,
  CallOptions,
  TRANSFER_TYPE,
} from '../types';
import { TelephonyUserConfig } from '../config/TelephonyUserConfig';
import { Call } from '../entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SettingService } from 'sdk/module/setting';
import { PhoneSetting } from '../setting';
import { ITelephonyService } from './ITelephonyService';
import { HealthModuleController } from 'sdk/framework/controller/impl/HealthModuleController';
import { MODULE_NAME, MODULE_IDENTIFY } from '../constants';
import { CallSwitchController } from '../controller/CallSwitchController';
import {
  RCPresenceEventPayload,
  ActiveCall,
} from 'sdk/module/rcEventSubscription/types';
import { RTCSipEmergencyServiceAddr } from 'voip';
import { IPersonService } from 'sdk/module/person/service/IPersonService';
import { IPhoneNumberService } from 'sdk/module/phoneNumber/service/IPhoneNumberService';
import { IRCInfoService } from 'sdk/module/rcInfo/service/IRCInfoService';

class TelephonyService extends EntityBaseService<Call>
  implements ITelephonyService {
  private _telephonyEngineController: TelephonyEngineController;
  private _userConfig: TelephonyUserConfig;
  private _phoneSetting: PhoneSetting;
  private _callSwitchController: CallSwitchController;

  constructor(
    private _personService: IPersonService,
    private _phoneNumberService: IPhoneNumberService,
    private _rcInfoService: IRCInfoService,
  ) {
    super({ isSupportedCache: true, entityName: 'CALL' });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGOUT]: this.handleLogOut,
      }),
    );

    this.setHealthModuleController(
      new HealthModuleController(MODULE_IDENTIFY, MODULE_NAME, {
        VoIP: () => ({ state: this.getVoipState() }),
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
    this._callSwitchController.start();
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
  };

  getVoipCallPermission = async () =>
    this.telephonyController.getVoipCallPermission();

  protected get telephonyController() {
    if (!this._telephonyEngineController) {
      this._telephonyEngineController = new TelephonyEngineController(
        this.userConfig,
        this.getEntityCacheController(),
        this._personService,
        this._phoneNumberService,
        this._rcInfoService,
      );
    }
    return this._telephonyEngineController;
  }

  private _init() {
    this.telephonyController.initEngine();
    this._callSwitchController = new CallSwitchController(this);
  }

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new TelephonyUserConfig();
    }
    return this._userConfig;
  }

  setTelephonyDelegate = (accountDelegate: ITelephonyDelegate) => {
    this.telephonyController.setAccountDelegate(accountDelegate);
  };

  getAllCallCount = () => {
    const accountController = this.telephonyController.getAccountController();
    return accountController ? accountController.getCallCount() : 0;
  };

  makeCall = async (toNumber: string, options?: CallOptions) => {
    const accountController = this.telephonyController.getAccountController();
    if (accountController) {
      return this.telephonyController
        .getAccountController()
        .makeCall(toNumber, options);
    }
    return MAKE_CALL_ERROR_CODE.INVALID_STATE;
  };

  switchCall = async (myNumber: string, switchCall: ActiveCall) => {
    const accountController = this.telephonyController.getAccountController();
    if (accountController) {
      return this.telephonyController
        .getAccountController()
        .switchCall(myNumber, switchCall);
    }
    return MAKE_CALL_ERROR_CODE.INVALID_STATE;
  };

  hangUp = (callId: number) => {
    this.telephonyController.getAccountController().hangUp(callId);
  };

  mute = (callId: number) => {
    this.telephonyController.getAccountController().mute(callId);
  };

  unmute = (callId: number) => {
    this.telephonyController.getAccountController().unmute(callId);
  };

  hold = async (callId: number) =>
    await this.telephonyController.getAccountController().hold(callId);

  unhold = async (callId: number) =>
    await this.telephonyController.getAccountController().unhold(callId);

  startRecord = async (callId: number) =>
    await this.telephonyController.getAccountController().startRecord(callId);

  stopRecord = async (callId: number) =>
    await this.telephonyController.getAccountController().stopRecord(callId);

  dtmf = (callId: number, digits: string) => {
    this.telephonyController.getAccountController().dtmf(callId, digits);
  };

  answer = (callId: number) => {
    this.telephonyController.getAccountController().answer(callId);
  };

  sendToVoiceMail = (callId: number) => {
    this.telephonyController.getAccountController().sendToVoiceMail(callId);
  };

  ignore = (callId: number) => {
    this.telephonyController.getAccountController().ignore(callId);
  };

  startReply = (callId: number) => {
    this.telephonyController.getAccountController().startReply(callId);
  };

  replyWithMessage = (callId: number, message: string) => {
    this.telephonyController
      .getAccountController()
      .replyWithMessage(callId, message);
  };

  park = async (callId: number) =>
    await this.telephonyController.getAccountController().park(callId);

  flip = async (callId: number, flipNumber: number) =>
    await this.telephonyController
      .getAccountController()
      .flip(callId, flipNumber);

  forward = async (callId: number, phoneNumber: string) =>
    await this.telephonyController
      .getAccountController()
      .forward(callId, phoneNumber);

  transfer = async (
    callId: number,
    type: TRANSFER_TYPE,
    transferTo: string,
  ) => {
    await this.telephonyController
      .getAccountController()
      .transfer(callId, type, transferTo);
  };

  replyWithPattern = (
    callId: number,
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    this.telephonyController
      .getAccountController()
      .replyWithPattern(callId, pattern, time, timeUnit);
  };

  getRingerDevicesList = () => this.telephonyController.getRingerDevicesList();

  getVoipState = () => {
    const accountController = this.telephonyController.getAccountController();
    return accountController ? accountController.getVoipState() : '';
  };

  get phoneSetting() {
    if (!this._phoneSetting) {
      this._phoneSetting = new PhoneSetting(this);
    }
    return this._phoneSetting;
  }

  setDataCollectionInfoConfig = (
    info: TelephonyDataCollectionInfoConfigType,
  ) => {
    this.telephonyController
      .getAccountController()
      .setDataCollectionInfoConfig(info);
  };

  async getSwitchCall() {
    return this._callSwitchController.getSwitchCall();
  }

  async handleRCPresence(
    presence: RCPresenceEventPayload,
    isFromPush: boolean,
  ) {
    return this._callSwitchController.handleTelephonyPresence(
      presence,
      isFromPush,
    );
  }

  isEmergencyAddrConfirmed = () => {
    return this.telephonyController.isEmergencyAddrConfirmed();
  };

  getWebPhoneId = () => {
    const accountController = this.telephonyController.getAccountController();
    return accountController ? accountController.getWebPhoneId() : undefined;
  };

  getRemoteEmergencyAddress = () => {
    return this.telephonyController.getRemoteEmergencyAddress();
  };

  hasActiveDL = () => {
    return this.telephonyController.hasActiveDL();
  };

  getLocalEmergencyAddress = () => {
    return this.telephonyController.getLocalEmergencyAddress();
  };

  isAddressEqual = (
    objAddr: RTCSipEmergencyServiceAddr,
    othAddr: RTCSipEmergencyServiceAddr,
  ) => {
    return this.telephonyController.isAddressEqual(objAddr, othAddr);
  };

  setLocalEmergencyAddress = (emergencyAddress: RTCSipEmergencyServiceAddr) => {
    this.telephonyController.setLocalEmergencyAddress(emergencyAddress);
  };

  updateLocalEmergencyAddress = (
    emergencyAddress: RTCSipEmergencyServiceAddr,
  ) => {
    this.telephonyController.updateLocalEmergencyAddress(emergencyAddress);
  };

  subscribeEmergencyAddressChange = (listener: notificationCallback) => {
    this.telephonyController.subscribeEmergencyAddressChange(listener);
  };

  subscribeSipProvEAUpdated = (listener: notificationCallback) => {
    this.telephonyController.subscribeSipProvEAUpdated(listener);
  };

  subscribeSipProvReceived = (listener: notificationCallback) => {
    this.telephonyController.subscribeSipProvReceived(listener);
  };

  getCallIdList = () => {
    return this.telephonyController.getAccountController().getCallIdList();
  };
}

export { TelephonyService };
