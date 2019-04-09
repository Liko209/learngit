/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:37
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { VoiceMailViewModel } from '../VoiceMail.ViewModel';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TelephonyService).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let ignoreViewModel: VoiceMailViewModel;

beforeAll(() => {
  ignoreViewModel = new VoiceMailViewModel();
});

describe('VoiceMailViewModel', () => {
  it('should call sendToVoiceMail function', () => {
    ignoreViewModel.sendToVoiceMail();
    const _telephonyService: TelephonyService = container.get(TelephonyService);
    expect(_telephonyService.sendToVoiceMail).toBeCalled();
  });
});
