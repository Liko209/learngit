/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { MinimizeViewModel } from '../Minimize.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

GlobalConfigService.getInstance = jest.fn();

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config');

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

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
