/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:52
 * Copyright © RingCentral. All rights reserved.
 */

import { CLIENT_SERVICE } from '@/modules/common/interface';
import { ClientService } from '@/modules/common';
import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { CALL_STATE } from '../../../FSM';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { DetachOrAttachViewModel } from '../DetachOrAttach.ViewModel';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');

GlobalConfigService.getInstance = jest.fn();

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
  endpoint_id: 'abc',
});

let detachOrAttachViewModel: DetachOrAttachViewModel;

beforeAll(() => {
  detachOrAttachViewModel = new DetachOrAttachViewModel();
  detachOrAttachViewModel._telephonyService.handleWindow = jest.fn();
});

describe('DetachOrAttachViewModel', () => {
  it('should call handleWindow()', async () => {
    detachOrAttachViewModel.detachOrAttach();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.handleWindow).toBeCalled();
  });
});
