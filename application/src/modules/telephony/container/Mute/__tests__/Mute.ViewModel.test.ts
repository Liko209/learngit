/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */
jest.mock('downshift');

import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { MuteViewModel } from '../Mute.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import * as telephony from '@/modules/telephony/module.config';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');
jest.mock('../../../service/TelephonyService');
jest.mock('@/modules/telephony/HOC/withDialogOrNewWindow');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let muteViewModel: MuteViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn().mockResolvedValue({}),
  });
  (getEntity as jest.Mock).mockReturnValue({});
  muteViewModel = new MuteViewModel();
  muteViewModel._telephonyService.muteOrUnmute = jest.fn();
});

describe('MuteViewModel', () => {
  it('should return mute status', () => {
    muteViewModel.muteOrUnmute();
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(muteViewModel.isMute).toEqual(_telephonyStore.isMute);
  });
  it('should muteOrUnmute', () => {
    muteViewModel.muteOrUnmute();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.muteOrUnmute).toHaveBeenCalled();
  });
});
