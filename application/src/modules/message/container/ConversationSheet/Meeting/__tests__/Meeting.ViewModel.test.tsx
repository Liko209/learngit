/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-05-23 09:29:52
 * Copyright © RingCentral. All rights reserved.
 */
import { MeetingViewModel } from '../Meeting.ViewModel';
import { testable, test } from 'shield';
import React from 'react';
import { mockEntity } from 'shield/application';
import Backend from "i18next-xhr-backend";
import i18next from 'i18next';
import MeetingItemModel from "@/store/models/MeetingItem";
import jsonFile from '../../../../../../../public/locales/en/translations.json';
import { MEETING_STATUS } from '../types';
import { mountWithTheme } from '@/__tests__/utils';
import { MeetingView } from '../Meeting.View';

let meetingVM: MeetingViewModel;
describe('MeetingViewModel', () => {
  beforeAll(() => {
    i18next.use(Backend).init(
      {
        lng: "en",
        debug: true,
        resources: {
          en: {
            translation: jsonFile
          }
        }
      },
      (err, t) => {}
    );
    i18next.loadLanguages('en', () => {});
    jest.resetAllMocks();
    meetingVM = new MeetingViewModel({
      ids: [123453]
    });
  });
  function mountComponent(viewProps: {
    title: string;
    status: MEETING_STATUS;
    duration?: string;
    number?: string;
  }) {
    const { title, status, duration = '',} = viewProps;
    const props = {
      meetingTitle: title,
      meetingItem: {
        status: status,
      } as MeetingItemModel,
      duration: duration
    };
    return mountWithTheme(<MeetingView {...props} />);
  }
  @testable
  class meetingTitle {
    @test(
      'should displayed starting Video Call information when someone start video call [JPT-2157]'
    )
    @mockEntity({
      status: MEETING_STATUS.NOT_STARTED
    })
    t1() {
      const title = 'Starting Video Call...';
      const wrapper = mountComponent({
        title,
        status: MEETING_STATUS.NOT_STARTED
      });
      expect(i18next.t(meetingVM.meetingTitle)).toBe(title);
      expect(wrapper.find('svg')).toHaveLength(1);
    }
    @test(
      'should displayed Video Call in progress when the video is in progress [JPT-2159]'
    )
    @mockEntity({
      status: MEETING_STATUS.LIVE
    })
    t2() {
      expect(i18next.t(meetingVM.meetingTitle)).toBe('Video Call in progress');
    }

    @test(
      'should displayed Video Call ended when the video call ended [JPT-2160]'
    )
    @mockEntity({
      status: MEETING_STATUS.ENDED,
      duration: 3601234
    })
    t3() {
      const title = 'Video Call ended';
      const wrapper = mountComponent({
        title,
        status: MEETING_STATUS.ENDED,
        duration: '02:30'
      });
      expect(i18next.t(meetingVM.meetingTitle)).toBe('Video Call ended');
      expect(meetingVM.duration).toBe('01:00:01');
      expect(wrapper.find('span')).toHaveLength(2);
    }
    @test('should displayed Video Call ended when the video call expired')
    @mockEntity({
      status: MEETING_STATUS.EXPIRED
    })
    t4() {
      const title = 'Video Call ended';
      const wrapper = mountComponent({
        title,
        status: MEETING_STATUS.EXPIRED,
      });
      expect(i18next.t(meetingVM.meetingTitle)).toBe(title);
      expect(wrapper.find('div')).toHaveLength(2);
    }
    @test('should displayed Video Call cancelled when the video call cancelled')
    @mockEntity({
      status: MEETING_STATUS.CANCELLED
    })
    t5() {
      const title = 'Video Call cancelled';
      expect(i18next.t(meetingVM.meetingTitle)).toBe(title);
      const wrapper = mountComponent({
        title,
        status: MEETING_STATUS.CANCELLED,
      });
      expect(wrapper.find('div')).toHaveLength(2);
    }
  }
});
