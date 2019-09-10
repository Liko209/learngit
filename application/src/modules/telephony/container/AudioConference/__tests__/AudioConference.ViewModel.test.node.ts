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
import { analyticsCollector } from '@/AnalyticsCollector';

jest.mock('@/modules/media/service');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');
jest.mock('computed-async-mobx', () => ({
  promisedComputed: (name: string, factory: any) => Promise.resolve(factory())
}))
decorate(injectable(), FeaturesFlagsService);
decorate(injectable(), TelephonyService);

container.bind(FeaturesFlagsService).to(FeaturesFlagsService);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let vm: AudioConferenceViewModel;
let group = {
  groupId: 123,
  type: CONVERSATION_TYPES.TEAM,
};
let telephonyService = {
  startAudioConference: jest.fn()
}
let featuresFlagsService = {
  canUseConference: jest.fn().mockResolvedValue(true)
}

const setUp = ({group, telephonyService, featuresFlagsService}: any) => {
  if (group) {
    jest.spyOn(utils, 'getEntity').mockImplementation(() => group);
  }
  if (telephonyService || featuresFlagsService) {
    container.get = jest.fn((key: any) => {
      if (key === TELEPHONY_SERVICE && telephonyService) {
        return telephonyService
      }

      if(key === FeaturesFlagsService && featuresFlagsService) {
        return featuresFlagsService
      }
    })
  }
}

setUp({group, telephonyService, featuresFlagsService})

describe('AudioConference.ViewModel', () => {

  it('should not render if id is not provided', () => {
    vm = new AudioConferenceViewModel();
    expect(vm.showIcon).resolves.toEqual(false);
  })

  it('should call service api when startAudioConference is called, and track data', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.TEAM,
    }
    setUp({
      group,
      telephonyService,
      FeaturesFlagsService,
    })
    analyticsCollector.startConferenceCall = jest.fn();

    vm = new AudioConferenceViewModel({ groupId: 123, analysisSource: 'conversationHeader'  });
    vm.startAudioConference();
    expect(telephonyService.startAudioConference).toHaveBeenCalledWith(123);
    expect(analyticsCollector.startConferenceCall).toHaveBeenCalled();
  });

  it('showIcon should be false if conversation is not group/team', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
      isMember: true
    }
    setUp({
      group,
      telephonyService,
      featuresFlagsService,
    })
    vm = new AudioConferenceViewModel({ groupId: 123 });

    expect(vm.showIcon).resolves.toBe(false);
  });

  it('showIcon should be false if canUseConference is false', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.TEAM,
      isMember: true,
    }
    featuresFlagsService.canUseConference.mockResolvedValue(false)
    setUp({
      group,
      telephonyService,
      featuresFlagsService,
    })
    vm = new AudioConferenceViewModel({ groupId: 123 });

    expect(vm.showIcon).resolves.toBe(false);
  });

  it('showIcon should be true if it is a team/group and canUseConference is true', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.TEAM,
      isMember: true,
    }
    featuresFlagsService.canUseConference.mockResolvedValue(true)
    setUp({
      group,
      telephonyService,
      featuresFlagsService,
    })
    vm = new AudioConferenceViewModel({ groupId: 123 });

    expect(vm.showIcon).resolves.toBe(true);
  });

  it('showIcon should be false if current user is not a member of the team/group', () => {
    const group = {
      groupId: 123,
      type: CONVERSATION_TYPES.TEAM,
      isMember: false,
    }
    featuresFlagsService.canUseConference.mockResolvedValue(true)
    setUp({
      group,
      telephonyService,
      featuresFlagsService,
    })
    vm = new AudioConferenceViewModel({ groupId: 123 });

    expect(vm.showIcon).resolves.toBe(false);
  })

  it('Should return false when service startAudioConference return falsy', async () => {
    const group = { groupId: 123, type: CONVERSATION_TYPES.TEAM };

    const telephonyService = {
      startAudioConference: jest.fn().mockReturnValue(false),
    };

    setUp({ group, telephonyService, FeaturesFlagsService });

    vm = new AudioConferenceViewModel({ groupId: 123 });

    const isConferenceSuccess = await vm.startAudioConference();
    expect(isConferenceSuccess).toBeFalsy();
  });
});
