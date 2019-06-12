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
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');
AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
  endpoint_id: 'abc',
});

decorate(injectable(), FeaturesFlagsService);
decorate(injectable(), TelephonyService);
decorate(injectable(), TelephonyStore);
decorate(injectable(), ClientService);

container.bind(FeaturesFlagsService).to(FeaturesFlagsService);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);
container.bind(CLIENT_SERVICE).to(ClientService);

let callViewModel: CallViewModel;

beforeEach(() => {
  callViewModel = new CallViewModel();
});

describe('CallViewModel', () => {
  it('`showIcon` should equals `false` when initializing', async () => {
    expect(callViewModel.showIcon.cached.value).toBe(false);
  });

  it('`_uid` should be empty', () => {
    expect(callViewModel._uid).toBeFalsy();
  });

  it('`_uid` should be 1', () => {
    callViewModel = new CallViewModel({
      id: 1,
    });
    expect(callViewModel._uid).toBe(1);
  });

  it('Should initialize `phoneNumber` with empty string', () => {
    expect(callViewModel.phoneNumber).toBe('');
  });

  it('`phoneNumber` should be `123`', () => {
    const phone = '123',
      callViewModel = new CallViewModel({
        phone,
      });
    expect(callViewModel.phoneNumber).toBe(phone);
  });

  it('Should not call `directCall` on service when has empty input', () => {
    callViewModel._telephonyService.directCall = jest.fn();
    callViewModel.call();
    expect(callViewModel._telephonyService.directCall).not.toBeCalled();
  });

  it('Should call `directCall` on service when has non-empty input', () => {
    const phone = '123',
      callViewModel = new CallViewModel({
        phone,
      });
    callViewModel._telephonyService.directCall = jest.fn();
    callViewModel.call();
    expect(callViewModel._telephonyService.directCall).toBeCalledWith(phone);
  });
});
