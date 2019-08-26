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
import { TelephonyService } from '@/modules/telephony/service/TelephonyService';
import * as media from '@/modules/media/module.config';
import { CONVERSATION_TYPES } from '@/constants';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');

decorate(injectable(), FeaturesFlagsService);
decorate(injectable(), TelephonyService);

container.bind(FeaturesFlagsService).to(FeaturesFlagsService);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let vm: AudioConferenceViewModel;
const group = {
  groupId: 123,
  type: CONVERSATION_TYPES.TEAM,
};
const telephonyService = {
  startAudioConference: jest.fn(),
};
const featuresFlagsService = {
  canUseTelephony: jest.fn().mockResolvedValue(true),
};

const setUp = ({ group, telephonyService, featureFlagsService }: any) => {
  if (group) {
    jest.spyOn(utils, 'getEntity').mockImplementation(() => group);
  }
  if (telephonyService || featureFlagsService) {
    container.get = jest.fn((key: any) => {
      if (key === TELEPHONY_SERVICE && telephonyService) {
        return telephonyService;
      }

      if (key === FeaturesFlagsService && featureFlagsService) {
        return featureFlagsService;
      }
    });
  }
};

setUp({ group, telephonyService, featuresFlagsService });

describe('AudioConference.ViewModel', () => {
  it('should call service api when startAudioConference is called', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.TEAM,
    };
    setUp({
      group,
      telephonyService,
    });
    vm = new AudioConferenceViewModel({ groupId: 123 });
    vm.startAudioConference();
    expect(telephonyService.startAudioConference).toHaveBeenCalledWith(123);
  });

  it('showIcon should be false if conversation is not group/team', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
    };
    setUp({
      group,
      telephonyService,
    });
    vm = new AudioConferenceViewModel({ groupId: 123 });

    expect(vm.showIcon.cached.value).toBe(false);
  });
});
