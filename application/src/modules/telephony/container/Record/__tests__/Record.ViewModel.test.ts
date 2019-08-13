/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { RecordViewModel } from '../Record.ViewModel';
import * as telephony from '@/modules/telephony/module.config';
import * as common from '@/modules/common/module.config';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';
import { RECORD_STATE } from 'sdk/module/telephony/entity';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/telephony/HOC');
jest.mock('@/modules/media/service');

jest.mock('@/store/utils');
jest.mock('sdk/module/telephony');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(common.config);
jupiter.registerModule(media.config);

let recordViewModel: RecordViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  (getEntity as jest.Mock).mockReturnValue({
    recordState: RECORD_STATE.DISABLED,
  });
  recordViewModel = new RecordViewModel();
});
describe('RecordViewModel', () => {
  it('Should be disabled', async () => {
    expect(recordViewModel.disabled).toBe(true);
  });
});
