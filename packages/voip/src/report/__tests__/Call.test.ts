/*
 * @Author: Spike.Yang
 * @Date: 2019-05-15 10:40:24
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { dataAnalysis } from 'foundation/analysis';
import { RTCCall } from '../../api/RTCCall';
import { IRTCCallDelegate } from '../../api/IRTCCallDelegate';
import { IRTCAccount } from '../../account/IRTCAccount';
import {
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCNoAudioStateEvent,
  RTCNoAudioDataEvent,
} from '../../api/types';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../../call/types';
import { sleep } from '../util';
import { WEBPHONE_SESSION_STATE } from '../../signaling/types';
import { FsmStatus, FsmStatusCategory } from '../types';

const UA =
  '(Macintosh; Intel Mac OS X 10_13_6) Chrome/73.0.3683.103 Safari/537.36';

const MockResponse = {
  headers: {
    'P-Rc-Api-Ids': [
      {
        raw:
          'party-id=cs172622609264474468-2;session-id=Y3MxNzI2MjI2MDkyNjQ0NzQ0NjhAMTAuNzQuMy4xNw',
      },
    ],
  },
};
class MockAccountAndCallObserver implements IRTCCallDelegate, IRTCAccount {
  notifyNoAudioStateEvent(
    uuid: string,
    noAudioStateEvent: RTCNoAudioStateEvent,
  ): void {}
  notifyNoAudioDataEvent(
    uuid: string,
    noAudioDataEvent: RTCNoAudioDataEvent,
  ): void {}
  getCallByUuid(uuid: string): RTCCall | undefined {
    return undefined;
  }
  createOutgoingCallSession(toNum: string): void {
    this.toNum = toNum;
  }
  removeCallFromCallManager(uuid: string): void {}
  public callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;
  public callAction: RTC_CALL_ACTION;
  public isReadyReturnValue: boolean = false;
  public toNum: string = '';

  onCallStateChange(state: RTC_CALL_STATE): void {
    this.callState = state;
  }

  onCallActionSuccess = jest.fn();
  onCallActionFailed = jest.fn();

  isReady(): boolean {
    return this.isReadyReturnValue;
  }

  getRegistrationStatusCode(): number {
    return 603;
  }
}

class MediaStreams extends EventEmitter2 {
  public onMediaConnectionStateChange: any;

  constructor(session: any) {
    super();
  }

  public reconnectMedia(options: any) {}

  getMediaStats(callback: any, interval: any) {}

  stopMediaStats() {}

  release() {}
}

class SessionDescriptionHandler extends EventEmitter2 {
  private _directionFlag: boolean = true;
  constructor() {
    super();
  }

  setDirectionFlag(flag: boolean) {
    this._directionFlag = flag;
  }

  getDirection(): string {
    if (this._directionFlag) {
      return 'sendonly';
    }
    return 'sendrecv';
  }
}
class MockSession extends EventEmitter2 {
  public sessionDescriptionHandler: SessionDescriptionHandler;
  public remoteIdentity: any;
  public mediaStreams: MediaStreams;
  constructor() {
    super();
    this.remoteIdentity = {
      displayName: 'test',
      uri: { aor: 'test@ringcentral.com' },
    };
    this.mediaStreams = new MediaStreams(this);
    this.sessionDescriptionHandler = new SessionDescriptionHandler();
  }

  emitSessionReinviteAccepted() {
    this.emit(WEBPHONE_SESSION_STATE.REINVITE_ACCEPTED, this);
  }

  emitSessionReinviteFailed() {
    this.emit(WEBPHONE_SESSION_STATE.REINVITE_FAILED, this);
  }

  mute = jest.fn();
  unmute = jest.fn();
  hold = jest.fn();
  unhold = jest.fn();
  forward = jest.fn();
  sendSessionMessage = jest.fn();
  replyWithMessage = jest.fn();
  terminate = jest.fn();
  accept = jest.fn();
  reject = jest.fn();
  toVoicemail = jest.fn();

  mockSignal(signal: string, response?: any): void {
    this.emit(signal, response);
  }
}

type Find = (arr: FsmStatus[], key: string) => FsmStatus | undefined;
const find: Find = (arr, key) => arr.find(o => o.name === key);

type Diff = (fsmStatus: FsmStatus[]) => number[];
const diff: Diff = fsmStatus => {
  const head = fsmStatus.slice(0, -1);
  const tail = fsmStatus.slice(1);

  return tail.map((item, index) => item.timestamp - head[index].timestamp);
};

dataAnalysis.track = jest.fn();

describe('Check all the report parameters if has call [JPT-1937]', () => {
  it('should has current value when make call [JPT-1937]', async () => {
    const account = new MockAccountAndCallObserver();
    const session = new MockSession();
    const call = new RTCCall(false, '123', null, account, account, undefined, {
      userAgent: UA,
    });

    jest.spyOn(call, '_setSipInfoIntoCallInfo').mockImplementation();
    call.setCallSession(session);
    call.onAccountReady();
    session.mockSignal('accepted');
    (call as any)._callSession.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS);
    (call as any)._callSession.getInviteResponse = jest
      .fn()
      .mockReturnValue(MockResponse);
    (call as any)._callSession.emit(CALL_SESSION_STATE.ACCEPTED);
    (call as any)._destroy();

    const { id, sessionId, ua, direction, establishment } = call._report;

    expect(!!id).toBeTruthy;
    expect(!!sessionId).toBeTruthy;
    expect(!!ua).toBeTruthy;
    expect(direction).toBe('outgoing');
    expect(
      parseFloat(establishment.establishDurationBulk as string),
    ).toBeGreaterThan(0);
  });

  it('should has current value when incoming call [JPT-1937]', async () => {
    const account = new MockAccountAndCallObserver();
    const session = new MockSession();
    const call = new RTCCall(
      true,
      '123',
      session,
      account,
      account,
      undefined,
      {
        userAgent: UA,
      },
    );

    call.setCallSession(session);
    session.mockSignal('accepted');
    (call as any)._callSession.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS);

    await sleep(10);
    (call as any)._callSession.emit(CALL_SESSION_STATE.CONFIRMED, MockResponse);
    await sleep(10);
    (call as any)._destroy();
    const { id, sessionId, ua, direction, establishment } = call._report;
    expect(!!id).toBeTruthy;
    expect(!!sessionId).toBeTruthy;
    expect(!!ua).toBeTruthy;
    expect(direction).toBe('incoming');
    expect(
      parseFloat(establishment.establishDurationBulk as string),
    ).toBeGreaterThan(0);
  });
});

describe('Check call FSM state timestamp [JPT-1938]', () => {
  it('should FSM has current status when incoming call [JPT-1938]', async () => {
    const account = new MockAccountAndCallObserver();
    const session = new MockSession();
    const call = new RTCCall(true, '123', session, account, account);
    await sleep(10);
    call.startReply();
    jest.spyOn(call, '_setSipInfoIntoCallInfo').mockImplementation();

    session.hold.mockResolvedValue(null);
    session.unhold.mockResolvedValue(null);
    await sleep(10);
    call.answer();
    session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
    await sleep(10);
    call.hold();
    session.emitSessionReinviteAccepted();
    await sleep(10);
    call.unhold();
    session.mockSignal('bye');
    await sleep(10);
    (call as any)._destroy();

    const fsmStatus = call._report.fsmStatus;
    const fsmStatusProps: FsmStatusCategory[] = [
      'idle',
      'replying',
      'answering',
      'connected',
      'holding',
      'holded',
      'unholding',
      'disconnected',
    ];

    const diffArr = diff(fsmStatus);
    for (const key of fsmStatusProps) {
      const item = find(fsmStatus, key);
      expect(item!.name).toBeDefined;
      expect(item!.timestamp).toBeDefined();
    }

    expect(fsmStatus.length).toBeGreaterThan(0);
    expect(diffArr.find(d => d <= 0)).toBeUndefined;
  });

  it('should FSM has current status when outgoing call [JPT-1938]', async () => {
    const account = new MockAccountAndCallObserver();
    const session = new MockSession();
    const call = new RTCCall(false, '123', null, account, account);
    jest.spyOn(call, '_setSipInfoIntoCallInfo').mockImplementation();
    call.setCallSession(session);
    call.onAccountNotReady();
    await sleep(10);
    call.onAccountReady();

    session.hold.mockResolvedValue(null);
    await sleep(10);
    session.unhold.mockResolvedValue(null);
    session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
    await sleep(10);
    call.hold();
    await sleep(10);
    session.emitSessionReinviteAccepted();
    await sleep(10);
    call.unhold();
    await sleep(10);
    session.mockSignal('bye');
    await sleep(10);
    (call as any)._destroy();

    const fsmStatus = call._report.fsmStatus;
    const fsmStatusProps: FsmStatusCategory[] = [
      'idle',
      'pending',
      'connecting',
      'connected',
      'holding',
      'holded',
      'unholding',
      'disconnected',
    ];
    const diffArr = diff(fsmStatus);
    for (const key of fsmStatusProps) {
      const item = find(fsmStatus, key);
      expect(item!.name).toBeDefined;
      expect(item!.timestamp).toBeDefined();
    }

    expect(fsmStatus.length).toBeGreaterThan(0);
    expect(diffArr.find(d => d <= 0)).toBeUndefined;
  });

  it('should FSM has current status when incoming call [JPT-1938]', async () => {
    const forwardNumber = '10000';
    const account = new MockAccountAndCallObserver();
    const session = new MockSession();
    const call = new RTCCall(true, '123', session, account, account);
    session.forward.mockResolvedValue(null);
    await sleep(10);
    call.forward(forwardNumber);
    await sleep(10);
    session.mockSignal('bye');
    await sleep(10);
    (call as any)._destroy();

    const fsmStatus = call._report.fsmStatus;
    const fsmStatusProps: FsmStatusCategory[] = [
      'idle',
      'forwarding',
      'disconnected',
    ];
    const diffArr = diff(fsmStatus);
    for (const key of fsmStatusProps) {
      const item = find(fsmStatus, key);
      expect(item!.name).toBeDefined;
      expect(item!.timestamp).toBeDefined();
    }

    expect(fsmStatus.length).toBeGreaterThan(0);
    expect(diffArr.find(d => d <= 0)).toBeUndefined;
  });
});

describe('check upload call and media report after call is terminated', () => {
  it('should called dataAnalysis api when end call [JPT-2000]', async () => {
    const account = new MockAccountAndCallObserver();
    const session = new MockSession();
    const call = new RTCCall(false, '123', null, account, account, undefined, {
      userAgent: UA,
    });
    jest.spyOn(call, '_setSipInfoIntoCallInfo').mockImplementation();
    call.setCallSession(session);
    call.onAccountReady();
    session.mockSignal('accepted');
    (call as any)._callSession.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS);
    (call as any)._callSession.getInviteResponse = jest
      .fn()
      .mockReturnValue(MockResponse);

    await sleep(10);
    (call as any)._callSession.emit(CALL_SESSION_STATE.ACCEPTED);
    await sleep(10);
    (call as any)._destroy();

    expect(dataAnalysis.track).toHaveBeenCalledWith(
      'Jup_Web/DT_phone_call_media_report',
      {
        info: JSON.stringify(call._report),
        type: 'call',
      },
    );
  });
});
