/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import { MeetingViewModel } from '../Meeting.ViewModel';
import { testable, test } from 'shield';
import React from 'react';
import { mockEntity } from 'shield/application';
import Backend from 'i18next-xhr-backend';
import i18next from 'i18next';
import MeetingItemModel from '@/store/models/MeetingItem';
import jsonFile from '../../../../../../../public/locales/en/translations.json';
import { MEETING_STATUS } from '@/store/models/MeetingsUtils';
import RCVideoMeetingItem from '@/store/models/RCVideoMeetingItem';
import { mountWithTheme } from 'shield/utils';
import { MeetingView } from '../Meeting.View';

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
      (err, t) => {},
    );
    i18next.loadLanguages('en', () => {});
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
});
