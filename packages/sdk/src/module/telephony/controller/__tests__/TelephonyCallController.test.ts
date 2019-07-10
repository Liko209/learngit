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
} from 'voip';
import {
  Call,
  HOLD_STATE,
  CALL_STATE,
  RECORD_STATE,
  MUTE_STATE,
} from '../../entity';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
import { ToggleController } from '../ToggleController';
import { CALL_ACTION_ERROR_CODE } from '../../types';

jest.mock('voip');
jest.mock('sdk/service/notificationCenter');

describe('TelephonyCallController', () => {
  class MockDelegate implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
  }

  class MockEntitySource {
    put() {}
    update() {}
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
  const callId = '123';
  let holdToggle: ToggleController;
  let recordToggle: ToggleController;

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
      expect(callController._handleCallStateChanged).toBeCalledWith(
        RTC_CALL_STATE.DISCONNECTED,
      );
      expect(rtcCall.hangup).toBeCalled();
    });
  });

  describe('mute', () => {
    it('should call rtc mute when controller mute is called', () => {
      jest.spyOn(rtcCall, 'mute');
      callController._updateCallMuteState = jest.fn();
      callController.mute();
      expect(callController._updateCallMuteState).toBeCalledWith(
        MUTE_STATE.MUTED,
      );
      expect(rtcCall.mute).toBeCalled();
    });
  });

  describe('unmute', () => {
    it('should call rtc unmute when controller unmute is called', () => {
      jest.spyOn(rtcCall, 'unmute');
      callController._updateCallMuteState = jest.fn();
      callController.unmute();
      expect(callController._updateCallMuteState).toBeCalledWith(
        MUTE_STATE.IDLE,
      );
      expect(rtcCall.unmute).toBeCalled();
    });
  });

  describe('hold', () => {
    it('should resolve when call is held successfully', (done: jest.DoneCallback) => {
      const options = '';
      expect.assertions(4);
      callController._updateCallHoldState = jest.fn();
      callController._updateCallRecordState = jest.fn();
      rtcCall.getRecordState = jest
        .fn()
        .mockReturnValue(RTC_RECORD_STATE.RECORDING);
      holdToggle.onSuccess = jest.fn();
      callController.hold().then(result => {
        expect(result).toEqual(options);
        done();
      });
      callController.onCallActionSuccess(RTC_CALL_ACTION.HOLD, options);
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.HELD,
      );
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING_DISABLED,
      );
      expect(holdToggle.onSuccess).toBeCalled();
    });

    it('should reject when call hold is failed', (done: jest.DoneCallback) => {
      callController._updateCallHoldState = jest.fn();
      callController._updateCallRecordState = jest.fn();
      rtcCall.getRecordState = jest.fn().mockReturnValue(RTC_RECORD_STATE.IDLE);
      expect.assertions(4);
      callController
        .hold()
        .then(result => {
          done();
        })
        .catch(result => {
          expect(result).toEqual('');
          done();
        });
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.HELD,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.HOLD, -1);
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.IDLE,
      );
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.IDLE,
      );
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
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.IDLE,
      );
      expect(callController._updateCallRecordState).toBeCalledWith(
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
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.IDLE,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.UNHOLD, -1);
      expect(callController._updateCallHoldState).toBeCalledWith(
        HOLD_STATE.HELD,
      );
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.DISABLED,
      );
      expect(holdToggle.onFailure).toBeCalled();
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
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionSuccess(RTC_CALL_ACTION.START_RECORD, options);
      expect(recordToggle.onSuccess).toBeCalled();
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
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionFailed(
        RTC_CALL_ACTION.START_RECORD,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      expect(callController._updateCallRecordState).toBeCalledWith(
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

      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
      callController.onCallActionFailed(RTC_CALL_ACTION.START_RECORD, -8);
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.IDLE,
      );
      expect(recordToggle.onFailure).toBeCalled();
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
      expect(callController._updateCallRecordState).toBeCalledWith(
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
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.IDLE,
      );
      callController.onCallActionFailed(
        RTC_CALL_ACTION.STOP_RECORD,
        RTC_CALL_ACTION_ERROR_CODE.INVALID,
      );
      expect(callController._updateCallRecordState).toBeCalledWith(
        RECORD_STATE.RECORDING,
      );
    });
  });

  describe('dtmf', () => {
    it('should call rtc to dtmf', () => {
      jest.spyOn(rtcCall, 'dtmf');
      const dtmfNumber = '98';
      callController.dtmf(dtmfNumber);
      expect(rtcCall.dtmf).toBeCalledWith(dtmfNumber);
    });
  });

  describe('answer', () => {
    it('should call rtc answer when controller answer is called', () => {
      jest.spyOn(rtcCall, 'answer');
      callController._getCallEntity = jest.fn().mockReturnValue({});
      callController.answer();
      expect(rtcCall.answer).toBeCalled();
    });
  });

  describe('sendToVoiceMail', () => {
    it('should call rtc to send call to voice mail', () => {
      jest.spyOn(rtcCall, 'sendToVoicemail');
      callController.sendToVoiceMail();
      expect(rtcCall.sendToVoicemail).toBeCalled();
    });
  });

  describe('ignore', () => {
    it('should call rtc to ignore call', () => {
      jest.spyOn(rtcCall, 'ignore');
      callController.ignore();
      expect(rtcCall.ignore).toBeCalled();
    });
  });

  describe('startReply', () => {
    it('should call rtc to start reply', () => {
      jest.spyOn(rtcCall, 'startReply');
      callController.startReply();
      expect(rtcCall.startReply).toBeCalled();
    });
  });

  describe('replyWithMessage', () => {
    it('should call rtc to reply with message', () => {
      jest.spyOn(rtcCall, 'replyWithMessage');
      const msg = 'test messages';
      callController.replyWithMessage(msg);
      expect(rtcCall.replyWithMessage).toBeCalledWith(msg);
    });
  });

  describe('replyWithPattern', () => {
    it('should call rtc to reply with pattern', () => {
      jest.spyOn(rtcCall, 'replyWithPattern');
      const pattern = RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER;
      const time = 10;
      const timeUnit = RTC_REPLY_MSG_TIME_UNIT.MINUTE;
      callController.replyWithPattern(pattern, time, timeUnit);
      expect(rtcCall.replyWithPattern).toBeCalledWith(pattern, time, timeUnit);
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
      expect(spy).toBeCalledWith(RTC_CALL_STATE.IDLE);
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
      expect(spy).toBeCalledWith(ENTITY.CALL, [
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
      expect(spy).not.toBeCalled();
    });
  });

  describe('_handleCallStateChanged', () => {
    it('should update call state and hold when state is connected', () => {
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({ sessionId: '123' });
      Date.now = jest.fn().mockReturnValue(1);
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(RTC_CALL_STATE.CONNECTED);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
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
      callController._handleCallStateChanged(RTC_CALL_STATE.CONNECTING);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.CONNECTING,
        },
      ]);
    });

    it('should update call state and hold when state is disconnected', () => {
      callController._getCallEntity = jest.fn().mockReturnValue({});
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._handleCallStateChanged(RTC_CALL_STATE.DISCONNECTED);
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          call_state: CALL_STATE.DISCONNECTED,
          disconnectTime: 1,
        },
      ]);
    });
  });

  describe('setRtcCall', () => {
    it('should update call info to entity', () => {
      const spy = jest.spyOn(notificationCenter, 'emitEntityUpdate');
      callController._getCallEntity = jest.fn().mockReturnValue({});
      callController.setRtcCall({
        getCallInfo: jest.fn().mockReturnValue({
          toNum: '1',
          fromNum: '2',
          uuid: '3',
        }),
        isIncomingCall: jest.fn().mockReturnValue(true),
      });
      expect(spy).toBeCalledWith(ENTITY.CALL, [
        {
          to_num: '1',
          from_num: '2',
          call_id: '3',
          direction: 'inbound',
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
      expect(holdToggle.onSuccess).toBeCalled();
    });

    it('should call onFailure when start record is failed', () => {
      recordToggle.onFailure = jest.fn();
      callController._handleToggleState(RTC_CALL_ACTION.START_RECORD, false);
      expect(recordToggle.onFailure).toBeCalled();
    });

    it('should do nothing when mute is completed successfully', () => {
      holdToggle.onSuccess = jest.fn();
      recordToggle.onSuccess = jest.fn();
      callController._handleToggleState(RTC_CALL_ACTION.MUTE, false);
      expect(holdToggle.onSuccess).not.toBeCalled();
      expect(recordToggle.onSuccess).not.toBeCalled();
    });
  });
});
