/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { MuteViewModel } from '../Mute.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import * as telephony from '@/modules/telephony/module.config';

jest.mock('../../../service/TelephonyService');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let muteViewModel: MuteViewModel;

beforeAll(() => {
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
    expect(_telephonyService.muteOrUnmute).toBeCalled();
  });
});
