/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { DialerKeypadHeaderViewModel } from '../DialerKeypadHeader.ViewModel';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let dialerKeypadHeader: DialerKeypadHeaderViewModel;

beforeAll(() => {
  dialerKeypadHeader = new DialerKeypadHeaderViewModel();
});

describe('DialerKeypadHeader', () => {
  it('Should quite the keypad panel', async () => {
    dialerKeypadHeader.quitKeypad();
    expect(dialerKeypadHeader.keypadEntered).toBe(false);
  });
});
