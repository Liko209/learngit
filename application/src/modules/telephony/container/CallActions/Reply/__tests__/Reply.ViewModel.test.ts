/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-27 16:13:36
 * Copyright © RingCentral. All rights reserved.
 */
import { ReplyViewModel } from '../Reply.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore, INCOMING_STATE } from '../../../../store';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let vm: ReplyViewModel;

describe('ReplyVM', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new ReplyViewModel();
  });

  it('directReply()', () => {
    const store = container.get(TelephonyStore);
    vm.directReply();
    expect(store.incomingState).toBe(INCOMING_STATE.REPLY);
  });
});
