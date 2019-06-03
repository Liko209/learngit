/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { RecordViewModel } from '../Record.ViewModel';
import * as telephony from '@/modules/telephony/module.config';
import * as common from '@/modules/common/module.config';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { RECORD_STATE } from 'sdk/module/telephony/entity';

jest.mock('@/store/utils');
jest.mock('sdk/module/telephony');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(common.config);

let recordViewModel: RecordViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  recordViewModel = new RecordViewModel();
});
describe('RecordViewModel', () => {
  it('Should be disabled', async () => {
    (getEntity as jest.Mock).mockReturnValue({
      recordState: RECORD_STATE.DISABLE,
    });
    expect(recordViewModel.disabled).toBe(true);
  });
});
