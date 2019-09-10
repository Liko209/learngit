/*
 * @Author: Spike.Yang
 * @Date: 2019-08-23 17:32:07
 * Copyright © RingCentral. All rights reserved.
 */

import CallModel from '../Call';

jest.mock('@/modules/telephony/helpers');

describe('CallModel', () => {
  it('new callModel', () => {
    const callModel = CallModel.fromJS({
      uuid: '1',
      to_num: '1',
      from_num: '2',
      call_state: 0,
      hold_state: 0,
      record_state: 0,
      session_id: '1',
      startTime: 1000,
      connectingTime: 1000,
      connectTime: 1000,
      disconnectTime: 1000,
      direction: 0,
      mute_state: 0,
      from_name: '1',
      to_name: '2',
    } as any);

    expect(callModel.uuid).toBe('1');
    expect(callModel.toNum).toBe('1');
    expect(callModel.fromNum).toBe('2');
    expect(callModel.callState).toBe(0);
    expect(callModel.holdState).toBe(0);
    expect(callModel.recordState).toBe(0);
    expect(callModel.sessionId).toBe('1');
    expect(callModel.startTime).toBe(1000);
    expect(callModel.connectingTime).toBe(1000);
    expect(callModel.connectTime).toBe(1000);
    expect(callModel.disconnectTime).toBe(1000);
    expect(callModel.direction).toBe(0);
    expect(callModel.muteState).toBe(0);
    expect(callModel.fromName).toBe('1');
    expect(callModel.toName).toBe('2');
  });
});
