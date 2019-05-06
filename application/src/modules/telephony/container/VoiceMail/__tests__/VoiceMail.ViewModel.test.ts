/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:37
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { VoiceMailViewModel } from '../VoiceMail.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

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
