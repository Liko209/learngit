/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { DialerContainerViewModel } from '../DialerContainer.ViewModel';
jest.mock('sdk/module/telephony');

import * as telephony from '@/modules/telephony/module.config';

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let dialerContainerViewModel: DialerContainerViewModel;

beforeAll(() => {
  dialerContainerViewModel = new DialerContainerViewModel();
});

describe('DialerContainerViewModel', () => {
  it('Should initialize with keypad not entered', async () => {
    expect(dialerContainerViewModel.keypadEntered).toBe(false);
  });
});
