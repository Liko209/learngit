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
} from 'voip';

jest.mock('voip');

describe('TelephonyCallController', () => {
  class MockDelegate implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  let mockDelegate;
  let callController: TelephonyCallController;
  let rtcCall: RTCCall;
  const callId = '123';

  function setup() {
    mockDelegate = new MockDelegate();
    callController = new TelephonyCallController(mockDelegate);

    rtcCall = new RTCCall(false, '', null, null, null);
    Object.assign(callController, {
      _rtcCall: rtcCall,
    });
    jest.spyOn(mockDelegate, 'onCallStateChange');
  }

  beforeAll(() => {
    clearMocks();
    setup();
  });

  describe('hangUp', () => {
    it('should call rtc hangup when controller hangup is called', () => {
      jest.spyOn(rtcCall, 'hangup');
      callController.hangUp();
      expect(rtcCall.hangup).toBeCalled();
    });
  });

  describe('mute', () => {
    it('should call rtc mute when controller mute is called', () => {
      jest.spyOn(rtcCall, 'mute');
      callController.mute();
      expect(rtcCall.mute).toBeCalled();
    });
  });

  describe('unmute', () => {
    it('should call rtc unmute when controller unmute is called', () => {
      jest.spyOn(rtcCall, 'unmute');
      callController.unmute();
      expect(rtcCall.unmute).toBeCalled();
    });
  });

  describe('hold', () => {
    it('should call rtc hold when controller hold is called', () => {
      jest.spyOn(rtcCall, 'hold');
      callController.hold();
      expect(rtcCall.hold).toBeCalled();
    });
  });

  describe('unhold', () => {
    it('should call rtc unhold when controller unhold is called', () => {
      jest.spyOn(rtcCall, 'unhold');
      callController.unhold();
      expect(rtcCall.unhold).toBeCalled();
    });
  });

  describe('startRecord', () => {
    it('should call rtc startRecord when controller startRecord is called', () => {
      jest.spyOn(rtcCall, 'startRecord');
      callController.startRecord();
      expect(rtcCall.startRecord).toBeCalled();
    });
  });

  describe('stopRecord', () => {
    it('should call rtc stopRecord when controller stopRecord is called', () => {
      jest.spyOn(rtcCall, 'stopRecord');
      callController.stopRecord();
      expect(rtcCall.stopRecord).toBeCalled();
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
    beforeAll(() => {
      jest.spyOn(rtcCall, 'getCallInfo').mockReturnValue({
        uuid: callId,
      });
    });
    it('should pass the idle state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.IDLE);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.IDLE,
      );
    });

    it('should pass the connected state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.CONNECTED);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.CONNECTED,
      );
    });

    it('should pass the connecting state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.CONNECTING);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.CONNECTING,
      );
    });

    it('should pass the disconnected state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        callId,
        RTC_CALL_STATE.DISCONNECTED,
      );
    });
  });
});
