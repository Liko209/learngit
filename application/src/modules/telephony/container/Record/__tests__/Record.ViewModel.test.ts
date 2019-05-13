/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { RecordViewModel } from '../Record.ViewModel';
import * as telephony from '@/modules/telephony/module.config';
jest.mock('sdk/module/telephony');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let recordViewModel: RecordViewModel;

beforeAll(() => {
  recordViewModel = new RecordViewModel();
});
describe('RecordViewModel', () => {
  it('Should be disabled', async () => {
    expect(recordViewModel.disabled).toBe(true);
  });
});
