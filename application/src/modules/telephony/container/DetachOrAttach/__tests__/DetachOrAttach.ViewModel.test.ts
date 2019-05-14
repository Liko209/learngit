/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:52
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { CALL_STATE } from '../../../FSM';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { DetachOrAttachViewModel } from '../DetachOrAttach.ViewModel';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config');

GlobalConfigService.getInstance = jest.fn();

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);

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
