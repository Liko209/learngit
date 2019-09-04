/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 10:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyService } from '../TelephonyService';
import { TelephonyEngineController } from '../../controller/TelephonyEngineController';
import { ITelephonyAccountDelegate } from '../ITelephonyAccountDelegate';
import { MAKE_CALL_ERROR_CODE , TRANSFER_TYPE } from '../../types';
import { MakeCallController } from '../../controller/MakeCallController';
import { ITelephonyCallDelegate } from '../ITelephonyCallDelegate';
import {
  RTC_CALL_ACTION,
  RTC_CALL_STATE,
  RTCCallActionSuccessOptions,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'voip';
import { TelephonyAccountController } from '../../controller/TelephonyAccountController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { TelephonyUserConfig } from '../../config/TelephonyUserConfig';
import { PhoneSetting } from '../../setting';
import { SettingService } from 'sdk/module/setting';
import { CallSwitchController } from '../../controller/CallSwitchController';
import { ActiveCall } from 'sdk/module/rcEventSubscription/types';


jest.mock('../../controller/CallSwitchController');
jest.mock('../../controller/TelephonyEngineController');
jest.mock('../../controller/TelephonyAccountController');
jest.mock('../../controller/MakeCallController');
jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');
jest.mock('../../../config');
jest.mock('../../config/TelephonyUserConfig');

describe('TelephonyService', () => {
  let telephonyService: TelephonyService;
  let engineController: TelephonyEngineController;
  let accountController: TelephonyAccountController;
  let makeCallController: MakeCallController;
  let mockSetting: PhoneSetting;
  let mockSettingService: SettingService;
  let callSwitchController: CallSwitchController;
  const callId = 123;
  const toNum = '123';
  class MockAcc implements ITelephonyAccountDelegate {
    onAccountStateChanged(state: TELEPHONY_ACCOUNT_STATE) {}
  }

  class MockCall implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
    onCallActionSuccess(
      callAction: RTC_CALL_ACTION,
      options: RTCCallActionSuccessOptions,
    ) {}
    onCallActionFailed(callAction: RTC_CALL_ACTION) {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  function setup() {
    const raw = ServiceLoader.getInstance;
    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.SETTING_SERVICE) {
        return mockSettingService;
      }
      return raw(key);
    });
    telephonyService = new TelephonyService();
    engineController = new TelephonyEngineController();
    accountController = new TelephonyAccountController(null, null, null);
    callSwitchController = new CallSwitchController(null as any);
    telephonyService['_callSwitchController'] = callSwitchController;
    mockSetting = ({
      getById: jest.fn(),
      getHandlerMap: jest.fn(),
    } as any) as PhoneSetting;
    mockSettingService = ({
      registerModuleSetting: jest.fn(),
      unRegisterModuleSetting: jest.fn(),
    } as any) as SettingService;

    engineController.getAccountController = jest
      .fn()
      .mockReturnValue(accountController);
    makeCallController = new MakeCallController();
    Object.assign(telephonyService, {
      _telephonyEngineController: engineController,
      _makeCallController: makeCallController,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('handleLogOut', () => {
    it('should call logout', () => {
      engineController.logout = jest.fn();
      telephonyService.handleLogOut();
      expect(engineController.logout).toHaveBeenCalled();
    });
  });

  describe('telephonyController', () => {
    it('should create telephonyController', () => {
      telephonyService['_telephonyEngineController'] = undefined as any;
      telephonyService['telephonyController'];
      expect(TelephonyEngineController).toHaveBeenCalled();
    });
  });

  describe('_init', () => {
    it('should call initEngine', () => {
      engineController.initEngine = jest.fn();
      telephonyService['_init']();
      expect(engineController.initEngine).toHaveBeenCalled();
    });
  });

  describe('userConfig', () => {
    it('should create userConfig', () => {
      telephonyService.userConfig;
      expect(TelephonyUserConfig).toHaveBeenCalled();
    });
  });

  describe('isAddressEqual', () => {
    it('should call with correct parameters', () => {
      const addr1 = { a: 'a' };
      const addr2 = { b: 'b' };
      engineController.isAddressEqual = jest.fn().mockReturnValue(true);
      const res = telephonyService.isAddressEqual(addr1, addr2);
      expect(res).toBeTruthy();
      expect(engineController.isAddressEqual).toHaveBeenCalledWith(
        addr1,
        addr2,
      );
    });
  });

  describe('switchCall', () => {
    const fromNumber = '1880191';
    it('should call account controller to switch call', async () => {
      const call = { to: '456' } as ActiveCall;
      await telephonyService.switchCall(fromNumber, call);
      expect(accountController.switchCall).toHaveBeenCalledWith(
        fromNumber,
        call,
      );
    });

    it('should return error when account controller is not created', async () => {
      engineController.getAccountController = jest
        .fn()
        .mockReturnValueOnce(null);
      const result = await telephonyService.makeCall(fromNumber, {} as any);
      expect(accountController.switchCall).not.toHaveBeenCalled();
      expect(result).toBe(MAKE_CALL_ERROR_CODE.INVALID_STATE);
    });
  });

  describe('makeCall', () => {
    it('should call account controller to make call', async () => {
      await telephonyService.makeCall('123', { fromNumber: '456' });
      expect(accountController.makeCall).toHaveBeenCalledWith('123', {
        fromNumber: '456',
      });
    });

    it('should return error when account controller is not created', async () => {
      engineController.getAccountController = jest
        .fn()
        .mockReturnValueOnce(null);
      const result = await telephonyService.makeCall(toNum);
      expect(accountController.makeCall).not.toHaveBeenCalled();
      expect(result).toBe(MAKE_CALL_ERROR_CODE.INVALID_STATE);
    });
  });

  describe('hangUp', () => {
    it('should call account controller to hang up ', () => {
      telephonyService.hangUp('123');
      expect(accountController.hangUp).toHaveBeenCalledWith('123');
    });
  });
  describe('mute', () => {
    it('should call account controller to mute', () => {
      telephonyService.mute('123');
      expect(accountController.mute).toHaveBeenCalledWith('123');
    });
  });
  describe('unmute', () => {
    it('should call account controller to unmute', () => {
      telephonyService.unmute('123');
      expect(accountController.unmute).toHaveBeenCalledWith('123');
    });
  });
  describe('hold', () => {
    it('should call account controller to hold', () => {
      telephonyService.hold('123');
      expect(accountController.hold).toHaveBeenCalledWith('123');
    });
  });
  describe('unhold', () => {
    it('should call account controller to unhold', () => {
      telephonyService.unhold('123');
      expect(accountController.unhold).toHaveBeenCalledWith('123');
    });
  });
  describe('startRecord', () => {
    it('should call account controller to startRecord', () => {
      telephonyService.startRecord('123');
      expect(accountController.startRecord).toHaveBeenCalledWith('123');
    });
  });
  describe('stopRecord', () => {
    it('should call account controller to stopRecord', () => {
      telephonyService.stopRecord('123');
      expect(accountController.stopRecord).toHaveBeenCalledWith('123');
    });
  });
  describe('dtmf', () => {
    it('should call account controller to dtmf', () => {
      telephonyService.dtmf('123', '456');
      expect(accountController.dtmf).toHaveBeenCalledWith('123', '456');
    });
  });
  describe('getAllCallCount', () => {
    it('should call account controller to get call count', () => {
      telephonyService.getAllCallCount();
      expect(accountController.getCallCount).toHaveBeenCalled();
    });
  });

  describe('answer', () => {
    it('should call account controller to answer call', () => {
      telephonyService.answer(callId);
      expect(accountController.answer).toHaveBeenCalledWith(callId);
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call account controller to send call to voice mail', () => {
      telephonyService.sendToVoiceMail(callId);
      expect(accountController.sendToVoiceMail).toHaveBeenCalledWith(callId);
    });
  });

  describe('ignore', () => {
    it('should call account controller to ignore', () => {
      telephonyService.ignore(callId);
      expect(accountController.ignore).toHaveBeenCalledWith(callId);
    });
  });

  describe('startReply', () => {
    it('should call account controller to startReply', () => {
      telephonyService.startReply(callId);
      expect(accountController.startReply).toHaveBeenCalledWith(callId);
    });
  });

  describe('replyWithMessage', () => {
    it('should call account controller to replyWithMessage', () => {
      const message = 'test message';
      telephonyService.replyWithMessage(callId, message);
      expect(accountController.replyWithMessage).toHaveBeenCalledWith(
        callId,
        message,
      );
    });
  });

  describe('replyWithPattern', () => {
    it('should call account controller to replyWithPattern', () => {
      const pattern = RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER;
      const time = 13;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      telephonyService.replyWithPattern(callId, pattern, time, timeUnit);
      expect(accountController.replyWithPattern).toHaveBeenCalledWith(
        callId,
        pattern,
        time,
        timeUnit,
      );
    });
  });

  describe('getVoipState', () => {
    it('should call account controller to get voip state', () => {
      const spy = jest.spyOn(accountController, 'getVoipState');
      telephonyService.getVoipState();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onStart', () => {
    it('should call registerModuleSetting', () => {
      telephonyService['_phoneSetting'] = mockSetting;
      telephonyService['onStarted']();
      expect(mockSettingService.registerModuleSetting).toHaveBeenCalledWith(
        mockSetting,
      );
    });
  });

  describe('onStop', () => {
    it('should call unsubscribe of profile setting', () => {
      telephonyService['_phoneSetting'] = mockSetting;
      telephonyService['onStopped']();
      expect(mockSettingService.unRegisterModuleSetting).toHaveBeenCalledWith(
        mockSetting,
      );
    });
  });

  describe('getRingerDevicesList', () => {
    it('should call getRingerDevicesList', () => {
      telephonyService.getRingerDevicesList();
      expect(engineController.getRingerDevicesList).toHaveBeenCalled();
    });
  });

  describe('getSwitchCall', () => {
    it('should call callSwitchController', async () => {
      const retData = { id: 1 };
      callSwitchController.getSwitchCall = jest.fn().mockResolvedValue(retData);
      const r = await telephonyService.getSwitchCall();
      expect(r).toEqual(retData);
    });
  });

  describe('transfer', () => {
    it('should call transfer', async () => {
      await telephonyService.transfer(
        callId,
        TRANSFER_TYPE.BLIND_TRANSFER,
        toNum,
      );
      expect(accountController.transfer).toHaveBeenCalledWith(
        callId,
        TRANSFER_TYPE.BLIND_TRANSFER,
        toNum,
      );
    });
  });

  describe('hasActiveDL', () => {
    it('should call engineController', async () => {
      engineController.hasActiveDL = jest.fn().mockReturnValue(true);
      const res = telephonyService.hasActiveDL();
      expect(res).toBeTruthy();
    });
  });
});
