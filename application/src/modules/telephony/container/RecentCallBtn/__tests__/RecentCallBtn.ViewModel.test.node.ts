/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 16:00:47
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentCallBtnViewModel } from '../RecentCallBtn.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let vm: RecentCallBtnViewModel;

beforeAll(() => {
  vm = new RecentCallBtnViewModel();
});

describe('ForwardBtnViewModel', () => {
  it('Should switch between [Back to dialer] button and [Recent calls] button. [JPT-2312]', () => {
    vm.jumpToRecentCall();
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(_telephonyStore.isRecentCalls).toBeTruthy();

    vm.backToDialer();
    expect(_telephonyStore.isRecentCalls).toBeFalsy();
  });

  it('Display [Recent calls] button when dialer opened and input field is empty. [JPT-2295]', () => {
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    _telephonyStore.inputString = '';
    expect(vm.shouldShowRecentCallBtn).toBeTruthy();
  });
});
