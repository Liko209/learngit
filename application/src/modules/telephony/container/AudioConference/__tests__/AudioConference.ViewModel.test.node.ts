/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-08-22 15:19:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as utils from '@/store/utils';
import { AudioConferenceViewModel } from '@/modules/telephony/container/AudioConference/AudioConference.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
// import { TelephonyStore } from '../../../store';
import { TelephonyService } from '@/modules/telephony/service/TelephonyService';

// import { CallViewModel } from '../Call.ViewModel';
// import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
// import { ClientService } from '@/modules/common';
// import { CLIENT_SERVICE } from '@/modules/common/interface';
import * as media from '@/modules/media/module.config';
import { CONVERSATION_TYPES } from '@/constants';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');
// AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
//   endpoint_id: 'abc',
// });

decorate(injectable(), FeaturesFlagsService);
decorate(injectable(), TelephonyService);
// decorate(injectable(), TelephonyStore);
// decorate(injectable(), ClientService);

container.bind(FeaturesFlagsService).to(FeaturesFlagsService);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
// container.bind(TelephonyStore).to(TelephonyStore);
// container.bind(CLIENT_SERVICE).to(ClientService);

let vm: AudioConferenceViewModel;
let group = {
  groupId: 123,
  type: CONVERSATION_TYPES.TEAM,
};
let telephonyService = {
  startAudioConference: jest.fn()
}
let featuresFlagsService = {
  canUseTelephony: jest.fn().mockResolvedValue(true)
}

const setUp = ({group, telephonyService, featureFlagsService}: any) => {
  if (group) {
    jest.spyOn(utils, 'getEntity').mockImplementation(() => group);
  }
  if (telephonyService || featureFlagsService) {
    container.get = jest.fn((key: any) => {
      if (key === TELEPHONY_SERVICE && telephonyService) {
        return telephonyService
      }

      if(key === FeaturesFlagsService && featureFlagsService) {
        return featureFlagsService
      }
    })
  }
}

setUp({group, telephonyService, featuresFlagsService})

describe('AudioConference.ViewModel', () => {
  it('should call service api when startAudioConference is called', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.TEAM,
    }
    setUp({
      group,
      telephonyService,
    })
    vm = new AudioConferenceViewModel({ groupId: 123 });
    vm.startAudioConference();
    expect(telephonyService.startAudioConference).toHaveBeenCalledWith(123);
  });

  it('showIcon should be false if conversation is not group/team', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
    }
    setUp({
      group,
      telephonyService,
    })
    vm = new AudioConferenceViewModel({ groupId: 123 });

    expect(vm.showIcon.cached.value).toBe(false);
  });
});
