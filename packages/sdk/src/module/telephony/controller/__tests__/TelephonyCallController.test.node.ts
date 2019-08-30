/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 22:29:08
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyCallController } from '../TelephonyCallController';
import { ITelephonyCallDelegate } from '../../service/ITelephonyCallDelegate';
import {
  RTC_CALL_STATE,
  RTCCall,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
  RTC_CALL_ACTION,
  RTC_CALL_ACTION_ERROR_CODE,
  RECORD_STATE as RTC_RECORD_STATE,
  RTCCallActionSuccessOptions,
  RTC_CALL_ACTION_DIRECTION,
} from 'voip';
import { HOLD_STATE, CALL_STATE, RECORD_STATE, MUTE_STATE } from '../../entity';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { ToggleController } from '../ToggleController';
import {
  CALL_ACTION_ERROR_CODE,
  CallDelegate,
  MAKE_CALL_ERROR_CODE,
  TRANSFER_TYPE,
} from '../../types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PhoneNumberService } from 'sdk/module/phoneNumber';

jest.mock('voip');
jest.mock('sdk/service/notificationCenter');
jest.mock('sdk/module/phoneNumber');
describe('TelephonyCallController', () => {
  class MockDelegate implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
  }

  class MockEntitySource {
    put() {}
    update() {}
  }

  class MockCallDelegate implements CallDelegate {
    onCallStateChange(callId: number, state: RTC_CALL_STATE) {}
    onCallActionSuccess(
      callId: number,
      callAction: RTC_CALL_ACTION,
      options: RTCCallActionSuccessOptions,
    ) {}
    onCallActionFailed(
      callId: number,
      callAction: RTC_CALL_ACTION,
      code: number,
    ) {}
  }

  class MockEntityCache {
    getSynchronously() {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  let mockDelegate;
  let callController: TelephonyCallController;
  let rtcCall: RTCCall;
  let mockEntitySource: MockEntitySource;
  let mockEntityCache: MockEntityCache;
  const callId = 123;
  const toNum = '123';
  let holdToggle: ToggleController;
  let recordToggle: ToggleController;
  let mockCallDelegate: MockCallDelegate;
  let phoneNumberService: PhoneNumberService;

  function setup() {
    mockDelegate = new MockDelegate();
    mockEntitySource = new MockEntitySource();
    mockEntityCache = new MockEntityCache();
    callController = new TelephonyCallController(
      1,
      mockDelegate,
      mockEntitySource,
      mockEntityCache,
    );

    rtcCall = new RTCCall(false, '', null, null, null);
    holdToggle = new ToggleController();
    recordToggle = new ToggleController();
    mockCallDelegate = new MockCallDelegate();

    phoneNumberService = new PhoneNumberService();
    ServiceLoader.getInstance = jest.fn().mockImplementation(config => {
      if (config === ServiceConfig.PHONE_NUMBER_SERVICE) {
        return phoneNumberService;
      }
    });

    Object.assign(callController, {
      _rtcCall: rtcCall,
      _holdToggle: holdToggle,
      _recordToggle: recordToggle,
    });
    jest.spyOn(mockDelegate, 'onCallStateChange');
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('hangUp', () => {
    it('should call rtc hangup when controller hangup is called', () => {
      jest.spyOn(rtcCall, 'hangup');
      callController._handleCallStateChanged = jest.fn();
      callController.hangUp();
      expect(callController._handleCallStateChanged).toHaveBeenCalledWith(
        CALL_STATE.DISCONNECTING,
      );
      expect(rtcCall.hangup).toHaveBeenCalled();
    });
  });

  describe('mute', () => {
    it('should call rtc mute when controller mute is called', () => {
      jest.spyOn(rtcCall, 'mute');
      callController._updateCallMuteState = jest.fn();
      callController.mute();
      expect(callController._updateCallMuteState).toHaveBeenCalledWith(
        MUTE_STATE.MUTED,
      );
      expect(rtcCall.mute).toHaveBeenCalled();
    });
  });

  describe('unmute', () => {
    it('should call rtc unmute when controller unmute is called', () => {
      jest.spyOn(rtcCall, 'unmute');
      callController._updateCallMuteState = jest.fn();
      callController.unmute();
      expect(callController._updateCallMuteState).toHaveBeenCalledWith(
        MUTE_STATE.IDLE,
      );
      expect(rtcCall.unmute).toHaveBeenCalled();
    });
  });

  describe('hold', () => {
    it('should resolve when call is held successfully', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(5);
      callController._updateCallHoldState = jest.fn();
      callController._updateCallRecordState = jest.fn();
      mockCallDelegate.onCallActionSuccess = jest.fn();
      callController.setCallDelegate(mockCallDelegate);
      rtcCall.getRecordState = jest
        .fn()
        .mockReturnValue(RTC_RECORD_STATE.RECORDING);
      holdToggle.onSuccess = jest.fn();
      callController.hold().then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.HOLD, options);
      expect(callController._updateCallHoldState).toHaveBeenCalledWith(
        HOLD_STATE.HELD,
      );
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.RECORDING_DISABLED,
      );
      expect(mockCallDelegate.onCallActionSuccess).toHaveBeenCalled();
      expect(holdToggle.onSuccess).toHaveBeenCalled();
    });

    it('should reject when call hold is failed', (done: jest.DoneCallback) => {
      callController._updateCallHoldState = jest.fn();
      callController._updateCallRecordState = jest.fn();
      mockCallDelegate.onCallActionFailed = jest.fn();
      callController.setCallDelegate(mockCallDelegate);
      rtcCall.getRecordState = jest.fn().mockReturnValue(RTC_RECORD_STATE.IDLE);
      expect.assertions(5);
      callController
        .hold()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallHoldState).toHaveBeenCalledWith(
        HOLD_STATE.HELD,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.HOLD, -1);
      expect(callController._updateCallHoldState).toHaveBeenCalledWith(
        HOLD_STATE.IDLE,
      );
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.IDLE,
      );
      expect(mockCallDelegate.onCallActionFailed).toHaveBeenCalled();
    });
  });

  describe('isOnHold', () => {
    it('should return true when call is on hold', () => {
      callController['_getCallEntity'] = jest.fn().mockReturnValue({
        hold_state: HOLD_STATE.HELD,
      });
      const res = callController.isOnHold();
      expect(res).toBeTruthy();
    });

    it('should return false when no call entity', () => {
      callController['_getCallEntity'] = jest.fn().mockReturnValue(null);
      const res = callController.isOnHold();
      expect(res).toBeFalsy();
    });
  });

  describe('unhold', () => {
    it('should resolve when call is unhold successfully', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(3);
      callController._updateCallHoldState = jest.fn();
      callController._updateCallRecordState = jest.fn();
      rtcCall.getRecordState = jest.fn().mockReturnValue(RTC_RECORD_STATE.IDLE);
      callController.unhold().then(result => {
        expect(result).toEqual(options);
        done();
      });
      expect(callController._updateCallHoldState).toHaveBeenCalledWith(
        HOLD_STATE.IDLE,
      );
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.IDLE,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.UNHOLD, options);
    });

    it('should reject when call unhold is failed', (done: jest.DoneCallback) => {
      callController._updateCallHoldState = jest.fn();
      callController._updateCallRecordState = jest.fn();
      holdToggle.onFailure = jest.fn();
      expect.assertions(5);
      callController
        .unhold()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallHoldState).toHaveBeenCalledWith(
        HOLD_STATE.IDLE,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.UNHOLD, -1);
      expect(callController._updateCallHoldState).toHaveBeenCalledWith(
        HOLD_STATE.HELD,
      );
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.DISABLED,
      );
      expect(holdToggle.onFailure).toHaveBeenCalled();
    });
  });

  describe('startRecord', () => {
    it('should resolve when startRecord is successfully', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(3);
      callController._updateCallRecordState = jest.fn();
      recordToggle.onSuccess = jest.fn();
      callController.startRecord().then(result => {
        expect(result).toEqual(CALL_ACTION_ERROR_CODE.NO_ERROR);
        done();
      });
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.START_RECORD, options);
      expect(recordToggle.onSuccess).toHaveBeenCalled();
    });

    it('should reject when startRecord is failed', (done: jest.DoneCallback) => {
      callController._updateCallRecordState = jest.fn();
      expect.assertions(3);
      callController
        .startRecord()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual(CALL_ACTION_ERROR_CODE.INVALID);
          done();
        });
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionFailed(
        RTC_CALL_ACTION.START_RECORD,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.IDLE,
      );
    });

    it('should reject with startRecord is failed with code -8 [JPT-2428]', (done: jest.DoneCallback) => {
      callController._updateCallRecordState = jest.fn();
      recordToggle.onFailure = jest.fn();
      expect.assertions(4);
      callController
        .startRecord()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual(CALL_ACTION_ERROR_CODE.ACR_ON);
          done();
        });

      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.START_RECORD, -8);
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.IDLE,
      );
      expect(recordToggle.onFailure).toHaveBeenCalled();
    });
  });

  describe('muteAll', () => {
    it('should mute two direction', () => {
      callController['_updateCallMuteState'] = jest.fn();
      callController.muteAll();
      expect(rtcCall.mute).toHaveBeenCalledWith(
        RTC_CALL_ACTION_DIRECTION.LOCAL,
      );
      expect(rtcCall.mute).toHaveBeenCalledWith(
        RTC_CALL_ACTION_DIRECTION.REMOTE,
      );
    });
  });

  describe('stopRecord', () => {
    it('should resolve when stopRecord is successfully', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(2);
      callController._updateCallRecordState = jest.fn();
      callController.stopRecord().then(result => {
        expect(result).toEqual(CALL_ACTION_ERROR_CODE.NO_ERROR);
        done();
      });
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.IDLE,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.STOP_RECORD, options);
    });

    it('should reject when stopRecord is failed', (done: jest.DoneCallback) => {
      callController._updateCallRecordState = jest.fn();
      expect.assertions(3);
      callController
        .stopRecord()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual(CALL_ACTION_ERROR_CODE.INVALID);
          done();
        });
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.IDLE,
      );
      callController.onCallActionFailed(
        RTC_CALL_ACTION.STOP_RECORD,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      expect(callController._updateCallRecordState).toHaveBeenCalledWith(
        RECORD_STATE.RECORDING,
      );
    });
  });

  describe('dtmf', () => {
    it('should call rtc to dtmf', () => {
      jest.spyOn(rtcCall, 'dtmf');
      const dtmfNumber = '98';
      callController.dtmf(dtmfNumber);
      expect(rtcCall.dtmf).toHaveBeenCalledWith(dtmfNumber);
    });
  });

  describe('answer', () => {
    it('should call rtc answer when controller answer is called', () => {
      jest.spyOn(rtcCall, 'answer');
      callController._getCallEntity = jest.fn().mockReturnValue({});
      callController.answer();
      expect(rtcCall.answer).toHaveBeenCalled();
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call rtc to send call to voice mail', () => {
      jest.spyOn(rtcCall, 'sendToVoicemail');
      callController.sendToVoiceMail();
      expect(rtcCall.sendToVoicemail).toHaveBeenCalled();
    });
  });

  describe('ignore', () => {
    it('should call rtc to ignore call', () => {
      jest.spyOn(rtcCall, 'ignore');
      callController.ignore();
      expect(rtcCall.ignore).toHaveBeenCalled();
    });
  });

  describe('startReply', () => {
    it('should call rtc to start reply', () => {
      jest.spyOn(rtcCall, 'startReply');
      callController.startReply();
      expect(rtcCall.startReply).toHaveBeenCalled();
    });
  });

  describe('replyWithMessage', () => {
    it('should call rtc to reply with message', () => {
      jest.spyOn(rtcCall, 'replyWithMessage');
      const msg = 'test messages';
      callController.replyWithMessage(msg);
      expect(rtcCall.replyWithMessage).toHaveBeenCalledWith(msg);
    });
  });

  describe('replyWithPattern', () => {
    it('should call rtc to reply with pattern', () => {
      jest.spyOn(rtcCall, 'replyWithPattern');
      const pattern = RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER;
      const time = 10;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      callController.replyWithPattern(pattern, time, timeUnit);
      expect(rtcCall.replyWithPattern).toHaveBeenCalledWith(
        pattern,
        time,
        timeUnit,
      );
    });
  });

  describe('onCallStateChange', () => {
    beforeEach(() => {
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({
        uuid: callId,
      });
      callController._handleCallStateChanged = jest.fn();
    });
    it('should pass the idle state to call controller', () => {
      const spy = jest.spyOn(callController, '_handleCallStateChanged');
      callController.onCallStateChange(RTC_CALL_STATE.IDLE);
      expect(spy).toHaveBeenCalledWith(CALL_STATE.IDLE);
    });

    it('should handle disconnecting when call is disconnected', () => {
      callController['_handleCallStateChanged'] = jest.fn();
      callController.onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
      expect(callController._handleCallStateChanged).toHaveBeenCalledWith(
        CALL_STATE.DISCONNECTED,
      );
    });
  });

  describe('_updateCallHoldState', () => {
    it('should update and notify entity changes ', () => {
      const call = {
        hold_state: 0,
      };
      callController._getCallEntity = jest.fn().mockReturnValue(call);
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._updateCallHoldState(HOLD_STATE.DISABLED);
      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          hold_state: HOLD_STATE.DISABLED,
        },
      ]);
    });

    it('should not update and notify when no entity is got', () => {
      clearMocks();
      callController._getCallEntity = jest.fn().mockReturnValue(null);
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._updateCallHoldState(HOLD_STATE.DISABLED);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('_handleCallStateChanged', () => {
    beforeEach(() => {
      clearMocks();
    });
    it('should update call state and hold when state is connected', () => {
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({ sessionId: '123' });
      Date.now = jest.fn().mockReturnValue(1);
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(CALL_STATE.CONNECTED);
      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.CONNECTED,
          hold_state: HOLD_STATE.IDLE,
          record_state: RECORD_STATE.IDLE,
          connectTime: 1,
          session_id: '123',
        },
      ]);
    });
    it('should update call state and hold when state is connecting', () => {
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(CALL_STATE.CONNECTING);
      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.CONNECTING,
        },
      ]);
    });

    it('should update call state and save sip data when state is disconnecting', () => {
      clearMocks();
      const call = {};
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({
        sessionId: '123',
        fromTag: 'f',
        toTag: 't',
        callId: '1',
      });
      callController._getCallEntity = jest.fn().mockReturnValue(call);
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(CALL_STATE.DISCONNECTING);
      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.DISCONNECTING,
          from_tag: 'f',
          to_tag: 't',
          call_id: '1',
        },
      ]);
      expect(call).toEqual(
        expect.objectContaining({
          call_id: '1',
          call_state: 'Disconnecting',
          from_tag: 'f',
          to_tag: 't',
        }),
      );
    });

    it('should update call state when state is disconnected', () => {
      const call = {};
      callController._getCallEntity = jest.fn().mockReturnValue(call);
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(CALL_STATE.DISCONNECTED);
      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.DISCONNECTED,
          disconnectTime: expect.any(Number),
        },
      ]);
    });
  });

  describe('setRtcCall', () => {
    it('should update call info to entity', () => {
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController['_getCallEntity'] = jest.fn().mockReturnValue({});
      const call = {
        getCallInfo: jest.fn().mockReturnValue({
          toNum: '1',
          fromNum: '2',
          uuid: '3',
        }),
        isIncomingCall: jest.fn().mockReturnValue(true),
      };
      callController.setRtcCall(call as any, false);

      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          to_num: '1',
          from_num: '2',
          uuid: '3',
          direction: 'Inbound',
          connectingTime: 1,
        },
      ]);
    });

    it('should update correct call info to entity when is outbound switch call', () => {
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController['_getCallEntity'] = jest.fn().mockReturnValue({});
      const call = {
        getCallInfo: jest.fn().mockReturnValue({
          toNum: '1',
          fromNum: '2',
          uuid: '3',
        }),
        isIncomingCall: jest.fn().mockReturnValue(true),
      };
      const callOption: any = {
        replaceNumber: '13',
        replaceName: 'rn',
        callDirection: 'Outbound',
      };
      callController.setRtcCall(call as any, true, callOption);

      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          connectingTime: expect.any(Number),
          direction: 'Outbound',
          to_name: 'rn',
          to_num: '13',
          uuid: '3',
        },
      ]);
    });

    it('should update correct call info to entity when is inbound switch call', () => {
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController['_getCallEntity'] = jest.fn().mockReturnValue({});
      const call = {
        getCallInfo: jest.fn().mockReturnValue({
          toNum: '1',
          fromNum: '2',
          uuid: '3',
        }),
        isIncomingCall: jest.fn().mockReturnValue(true),
      };
      const callOption: any = {
        replaceNumber: '13',
        replaceName: 'rn',
        callDirection: 'Inbound',
      };
      callController.setRtcCall(call as any, true, callOption);

      expect(spy).toHaveBeenCalledWith(ENTITY.CALL, [
        {
          connectingTime: expect.any(Number),
          direction: 'Outbound',
          to_name: 'rn',
          to_num: '13',
          uuid: '3',
        },
      ]);
    });
  });

  describe('park', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should resolve with park id', async (done: jest.DoneCallback) => {
      const options = {
        parkExtension: '801',
      };
      expect.assertions(1);
      callController.park().then(result => {
        expect(result).toEqual('801');
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.PARK, options);
    });
    it('should reject with error', (done: jest.DoneCallback) => {
      expect.assertions(1);
      callController
        .park()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      callController.onCallActionFailed(RTC_CALL_ACTION.PARK, -1);
    });
  });

  describe('flip', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should resolve with success', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(1);
      callController.flip('number').then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.FLIP, options);
    });
    it('should reject with error', (done: jest.DoneCallback) => {
      expect.assertions(1);
      callController
        .flip('number')
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      callController.onCallActionFailed(RTC_CALL_ACTION.FLIP, -1);
    });
  });

  describe('forward', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should resolve with success', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(1);
      callController.forward('number').then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.FORWARD, options);
    });
    it('should reject with error', (done: jest.DoneCallback) => {
      expect.assertions(1);
      callController
        .forward('number')
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      callController.onCallActionFailed(RTC_CALL_ACTION.FORWARD, -1);
    });
  });

  describe('_handleToggleState', () => {
    it('should call onSuccess when call hold is completed successfully', () => {
      holdToggle.onSuccess = jest.fn();
      callController._handleToggleState(RTC_CALL_ACTION.HOLD, true);
      expect(holdToggle.onSuccess).toHaveBeenCalled();
    });

    it('should call onFailure when start record is failed', () => {
      recordToggle.onFailure = jest.fn();
      callController._handleToggleState(RTC_CALL_ACTION.START_RECORD, false);
      expect(recordToggle.onFailure).toHaveBeenCalled();
    });

    it('should do nothing when mute is completed successfully', () => {
      holdToggle.onSuccess = jest.fn();
      recordToggle.onSuccess = jest.fn();
      callController._handleToggleState(RTC_CALL_ACTION.MUTE, false);
      expect(holdToggle.onSuccess).not.toHaveBeenCalled();
      expect(recordToggle.onSuccess).not.toHaveBeenCalled();
    });
  });
  describe('transfer', () => {
    beforeEach(() => {
      phoneNumberService.getE164PhoneNumber = jest
        .fn()
        .mockResolvedValue(toNum);
    });
    it('should reject not network when disconnect network', (done: jest.DoneCallback) => {
      const options = CALL_ACTION_ERROR_CODE.NOT_NETWORK;
      expect(
        callController.transfer(TRANSFER_TYPE.WARM_TRANSFER, toNum),
      ).rejects.toEqual(options);
      callController.onCallActionFailed(RTC_CALL_ACTION.WARM_TRANSFER, options);
      done();
    });
    it('should resolve warm transfer success when type is WARM_TRANSFER', (done: jest.DoneCallback) => {
      expect.assertions(1);
      const options = '';
      expect(
        callController.transfer(TRANSFER_TYPE.WARM_TRANSFER, toNum),
      ).resolves.toEqual(options);
      callController.onCallActionSuccess(
        RTC_CALL_ACTION.WARM_TRANSFER,
        options as RTCCallActionSuccessOptions,
      );
      done();
    });
    it('should reject fail when type is WARM_TRANSFER', (done: jest.DoneCallback) => {
      expect.assertions(1);
      const options = CALL_ACTION_ERROR_CODE.INVALID_PHONE_NUMBER;
      expect(
        callController.transfer(TRANSFER_TYPE.WARM_TRANSFER, toNum),
      ).rejects.toEqual(options);
      callController.onCallActionFailed(RTC_CALL_ACTION.WARM_TRANSFER, options);
      done();
    });

    it('should resolve transfer success when type is BLIND_TRANSFER', async (done: jest.DoneCallback) => {
      const options = '';
      expect(
        callController.transfer(TRANSFER_TYPE.BLIND_TRANSFER, toNum),
      ).resolves.toEqual(options);
      callController.onCallActionSuccess(
        RTC_CALL_ACTION.TRANSFER,
        options as RTCCallActionSuccessOptions,
      );
      setTimeout(() => {
        expect(rtcCall.transfer).toHaveBeenCalledWith('123');
        done();
      });
    });
    it('should reject fail when type is BLIND_TRANSFER', (done: jest.DoneCallback) => {
      expect.assertions(1);
      const options = CALL_ACTION_ERROR_CODE.INVALID_PHONE_NUMBER;
      expect(
        callController.transfer(TRANSFER_TYPE.BLIND_TRANSFER, toNum),
      ).rejects.toEqual(options);
      callController.onCallActionFailed(RTC_CALL_ACTION.TRANSFER, options);
      done();
    });
    it('should reject fail when number can not e164', async (done: jest.DoneCallback) => {
      phoneNumberService.getE164PhoneNumber = jest.fn().mockResolvedValue('');
      await expect(
        callController.transfer(TRANSFER_TYPE.BLIND_TRANSFER, toNum),
      ).rejects.toEqual(CALL_ACTION_ERROR_CODE.INVALID_PHONE_NUMBER);
      done();
    });
    it('should resolve to voicemail success when type is TO_VOICEMAIL', async (done: jest.DoneCallback) => {
      const options = '';
      expect(
        callController.transfer(TRANSFER_TYPE.TO_VOICEMAIL, toNum),
      ).resolves.toEqual(options);
      callController.onCallActionSuccess(
        RTC_CALL_ACTION.TRANSFER,
        options as RTCCallActionSuccessOptions,
      );
      setTimeout(() => {
        expect(rtcCall.transfer).toHaveBeenCalledWith('*0123');
        done();
      });
    });
  });
});
