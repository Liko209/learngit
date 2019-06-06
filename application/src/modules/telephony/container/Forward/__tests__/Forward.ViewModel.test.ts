/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-30 13:55:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ForwardViewModel } from '../Forward.ViewModel';
import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let vm: ForwardViewModel;

beforeAll(() => {
  vm = new ForwardViewModel();
  vm._telephonyStore.backIncoming = jest.fn();
});

describe('ForwardBtnViewModel', () => {
  it('Should back to incoming call page when click back icon [JPT-2129]', () => {
    vm.quitForward();
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);

    expect(_telephonyStore.backIncoming).toHaveBeenCalled();
  });

  it('should call clearEnteredKeys function', () => {
    vm.dispose();
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);

    expect(_telephonyStore.backIncoming).toHaveBeenCalled();
  });
});
