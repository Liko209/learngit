/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:37
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { TelephonyService } from '../../../service/TelephonyService';
import { VoiceMailViewModel } from '../VoiceMail.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import * as telephony from '@/modules/telephony/module.config';

jest.mock('../../../service/TelephonyService');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let ignoreViewModel: VoiceMailViewModel;

beforeAll(() => {
  ignoreViewModel = new VoiceMailViewModel();
});

describe('VoiceMailViewModel', () => {
  it('should call sendToVoiceMail function', () => {
    ignoreViewModel.sendToVoiceMail();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.sendToVoiceMail).toBeCalled();
  });
});
