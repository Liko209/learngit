/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { CallViewModel } from '../Call.ViewModel';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');
AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
  endpoint_id: 'abc',
});

decorate(injectable(), FeaturesFlagsService);
decorate(injectable(), TelephonyService);
decorate(injectable(), TelephonyStore);

container.bind(FeaturesFlagsService).to(FeaturesFlagsService);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let callViewModel: CallViewModel;

beforeAll(() => {
  callViewModel = new CallViewModel();
});

describe('CallViewModel', () => {
  it('`showIcon` should equals `false` when initializing', async () => {
    expect(callViewModel.showIcon.cached.value).toBe(false);
  });
});
