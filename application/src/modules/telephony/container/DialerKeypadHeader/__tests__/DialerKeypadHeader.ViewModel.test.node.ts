/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { DialerKeypadHeaderViewModel } from '../DialerKeypadHeader.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');
decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let dialerKeypadHeader: DialerKeypadHeaderViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  (getEntity as jest.Mock).mockReturnValue({});
  dialerKeypadHeader = new DialerKeypadHeaderViewModel();
});

describe('DialerKeypadHeader', () => {
  it('Should quite the keypad panel', async () => {
    dialerKeypadHeader.quitKeypad();
    expect(dialerKeypadHeader.keypadEntered).toBe(false);
  });
});
