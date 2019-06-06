/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { HoldViewModel } from '../Hold.ViewModel';
import * as telephony from '@/modules/telephony/module.config';
import * as common from '@/modules/common/module.config';

import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { HOLD_STATE } from 'sdk/module/telephony/entity';

jest.mock('@/store/utils');
jest.mock('sdk/module/telephony');
const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(common.config);

let holdViewModel: HoldViewModel;
beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  holdViewModel = new HoldViewModel();
});

describe('HoldViewModel', () => {
  it('Should be disabled', async () => {
    (getEntity as jest.Mock).mockReturnValue({
      holdState: HOLD_STATE.DISABLE,
    });
    expect(holdViewModel.disabled).toBe(true);
  });
});
