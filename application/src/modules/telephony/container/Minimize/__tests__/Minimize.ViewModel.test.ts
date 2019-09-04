/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { MinimizeViewModel } from '../Minimize.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);


decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

GlobalConfigService.getInstance = jest.fn();

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let minimizeViewModel: MinimizeViewModel;

beforeAll(() => {
  AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
    endpoint_id: 'abc',
  });
  minimizeViewModel = new MinimizeViewModel();
  minimizeViewModel._telephonyService.minimize = jest.fn();
});
describe('MinimizeViewModel', () => {
  it('Should call minimize()', async () => {
    minimizeViewModel.minimize();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.minimize).toBeCalled();
  });
});
