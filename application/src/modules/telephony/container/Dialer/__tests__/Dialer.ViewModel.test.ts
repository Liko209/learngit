/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:52
 * Copyright © RingCentral. All rights reserved.
 */

import { CLIENT_SERVICE } from '@/modules/common/interface';
import { ClientService } from '@/modules/common';
import { container, decorate, injectable } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { ServiceLoader } from 'sdk/module/serviceLoader';

import { DialerViewModel } from '../Dialer.ViewModel';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { getEntity } from '@/store/utils';
import { MediaService } from '@/modules/media/service';
import { IMediaService } from '@/interface/media';
import { DialerUIConfig } from '../../../Dialer.config';

jupiter.registerService(IMediaService, MediaService);
jest.mock('@/store/utils');
jest.mock('../../../Dialer.config');
decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);
decorate(injectable(), DialerUIConfig);

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');

GlobalConfigService.getInstance = jest.fn();

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);
container.bind(DialerUIConfig).to(DialerUIConfig);

let dialerViewModel: DialerViewModel;

beforeAll(() => {
  AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
    endpoint_id: 'abc',
  });
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  (getEntity as jest.Mock).mockReturnValue({});
  dialerViewModel = new DialerViewModel();
});

describe('DialerViewModel', () => {
  it('should initialize with keypad not entered', async () => {
    expect(dialerViewModel.keypadEntered).toEqual(false);
  });
  it('should initialize without fade animation', async () => {
    expect(dialerViewModel.startMinimizeAnimation).toEqual(false);
  });
  it('should initialize with dialerId', async () => {
    expect(typeof dialerViewModel.dialerId).toBe('string');
  });

  describe('isIncomingCall()', () => {
    it('should isIncomingCall is false when in incoming page but isTransferPage is true', async () => {
      dialerViewModel._telephonyStore.isTransferPage = true;
      expect(dialerViewModel.isIncomingCall).toBeFalsy();
    });
  });
});
