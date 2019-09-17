/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { container } from 'framework/ioc';
import { mockEntity, mockSingleEntity } from 'shield/application';
import { mountWithTheme } from 'shield/utils';
import { mockService } from 'shield/sdk';
import React from 'react';
import Backend from 'i18next-xhr-backend';
import i18next from 'i18next';
import MeetingItemModel from '@/store/models/MeetingItem';
import jsonFile from '../../../../../../../public/locales/en/translations.json';
import { MEETING_STATUS } from '@/store/models/MeetingsUtils';
import RCVideoMeetingItem from '@/store/models/RCVideoMeetingItem';
import { MeetingView } from '../Meeting.View';
import { MeetingViewModel } from '../Meeting.ViewModel';
import { MeetingsService } from 'sdk/module/meetings';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { mainLogger } from 'foundation/log/index';
import { MEETING_ACTION } from 'sdk/module/meetings/types';


let meetingVM: MeetingViewModel;
describe('MeetingViewModel', () => {
  beforeAll(() => {
    i18next.use(Backend).init(
      {
        lng: 'en',
        debug: true,
        resources: {
          en: {
            translation: jsonFile,
          },
        },
      },
      (err, t) => { },
    );
    i18next.loadLanguages('en', () => { });
    jest.resetAllMocks();
    meetingVM = new MeetingViewModel({
      ids: [570810475],
    });
  });
  function mountComponent(viewProps: {
    title: string;
    meetingStatus: MEETING_STATUS;
    duration?: string;
    number?: string;
    subTitle?: string;
    meetingId: number;
  }) {
    const { title, meetingStatus, duration = '', meetingId } = viewProps;
    const props = {
      meetingTitle: title,
      meetingItem: {
        meetingStatus,
      } as MeetingItemModel | RCVideoMeetingItem,
      meetingId,
      duration,
    };
    return mountWithTheme(<MeetingView {...props} />);
  }
  @testable
  class meetingTitle {
    @test(
      'should displayed starting Video Call information when someone start video call [JPT-2157]',
    )
    @mockEntity({
      meetingStatus: MEETING_STATUS.NOT_STARTED,
    })
    t1() {
      meetingVM = new MeetingViewModel({
        ids: [570810475],
      });
      const title = 'Starting Video Call...';
      const wrapper = mountComponent({
        title,
        meetingStatus: MEETING_STATUS.NOT_STARTED,
        meetingId: meetingVM.meetingId,
      });
      expect(i18next.t(meetingVM.meetingTitle)).toBe(title);
      expect(wrapper.find('svg')).toHaveLength(1);
    }
    @test(
      'should displayed Video Call in progress when the video is in progress [JPT-2159]',
    )
    @mockEntity({
      meetingStatus: MEETING_STATUS.LIVE,
    })
    t2() {
      expect(i18next.t(meetingVM.meetingTitle)).toBe('Video Call in progress');
    }

    @test(
      'should displayed Video Call ended when the video call ended [JPT-2160]',
    )
    @mockEntity({
      meetingStatus: MEETING_STATUS.ENDED,
      duration: 3601234,
    })
    t3() {
      const title = 'Video Call ended';
      const wrapper = mountComponent({
        title,
        meetingStatus: MEETING_STATUS.ENDED,
        duration: '02:30',
        meetingId: meetingVM.meetingId,
      });
      expect(i18next.t(meetingVM.meetingTitle)).toBe('Video Call ended');
      expect(meetingVM.duration).toBe('01:00:01');
      expect(wrapper.find('span').find({ 'data-id': 'subTitle' })).toHaveLength(
        1,
      );
    }
    @test('should displayed Video Call ended when the video call expired')
    @mockEntity({
      meetingStatus: MEETING_STATUS.EXPIRED,
    })
    t4() {
      const title = 'Video Call ended';
      const wrapper = mountComponent({
        title,
        meetingStatus: MEETING_STATUS.EXPIRED,
        meetingId: meetingVM.meetingId,
      });
      expect(i18next.t(meetingVM.meetingTitle)).toBe(title);
      expect(wrapper.find('div')).toHaveLength(2);
    }
    @test('should displayed Video Call cancelled when the video call cancelled')
    @mockEntity({
      meetingStatus: MEETING_STATUS.CANCELLED,
    })
    t5() {
      const title = 'Video Call cancelled';
      expect(i18next.t(meetingVM.meetingTitle)).toBe(title);
      const wrapper = mountComponent({
        title,
        meetingStatus: MEETING_STATUS.CANCELLED,
        meetingId: meetingVM.meetingId,
      });
      expect(wrapper.find('div')).toHaveLength(2);
    }
    @test('should displayed no answer when no answer for this video call')
    @mockEntity({
      meetingStatus: MEETING_STATUS.NO_ANSWER,
    })
    t6() {
      const title = 'No Answer for This Video Call';
      expect(meetingVM.meetingTitle).toBe(title);
      const wrapper = mountComponent({
        title,
        meetingStatus: MEETING_STATUS.NO_ANSWER,
        meetingId: meetingVM.meetingId,
      });
      expect(wrapper.find('div')).toHaveLength(2);
    }
  }

  @testable
  class joinMeeting {
    @test('should be openwindow if called')
    @mockService(MeetingsService, 'getJoinUrl', "link")
    @mockEntity({})
    async t1() {
      const electronService = {
        openWindow: jest.fn(),
      }
      container.get = jest.fn().mockReturnValue(electronService);
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: { openWindow: () => 123 }
      })
      await meetingVM.joinMeeting();
      expect(electronService.openWindow).toHaveBeenCalled();
    }

    @test('should call window.open when window.jupiterElectron does not exist')
    @mockService(MeetingsService, 'getJoinUrl', "link")
    @mockEntity({})
    async t2() {
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: false
      })
      Object.defineProperty(window, 'open', {
        writable: true,
        value: jest.fn()
      })
      await meetingVM.joinMeeting();
      expect(window.open).toHaveBeenCalled();
    }
  }

  @testable
  class callbackMeeting {
    @test('should call window.open if called')
    @mockService(MeetingsService, 'startMeeting', {
      action: MEETING_ACTION.DEEP_LINK,
      link: '123123'
    })
    async t1() {
      Object.defineProperty(window, 'open', {
        writable: true,
        value: jest.fn()
      })
      await meetingVM.callbackMeeting();
      expect(window.open).toHaveBeenCalled();
    }

    @test('should show alert if called')
    @mockService(MeetingsService, 'startMeeting', {
      action: ''
    })
    async t2() {
      Object.defineProperty(mainLogger, 'info', {
        writable: true,
        value: jest.fn()
      })
      await meetingVM.callbackMeeting();
      expect(mainLogger.info).toHaveBeenCalled();
    }
  }

  const meetingsService = {
    name: ServiceConfig.MEETINGS_SERVICE,
    cancelMeeting: () => 123
  }
  @testable
  class cancelMeeting {
    @test('should call cancelMeeting if called')
    @mockEntity({})
    @mockService(meetingsService, 'cancelMeeting')
    async t1() {
      await meetingVM.cancelMeeting();
      expect(meetingsService.cancelMeeting).toHaveBeenCalled();
    }
  }

  @testable
  class canUseVideoCall {
    @test('should be true if canUseVideoCall')
    @mockSingleEntity(true)
    t1() {
      meetingVM = new MeetingViewModel();
      expect(meetingVM.canUseVideoCall).toBe(true);
    }
  }
});
