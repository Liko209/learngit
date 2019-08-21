/*
 * @Author: cooper.ruan
 * @Date: 2019-08-19 15:54:26
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { container, decorate, injectable } from 'framework/ioc';

import { MeetingService } from '../../../service/MeetingService';
import { MeetingViewModel } from '../Meeting.ViewModel';

import { MEETING_SERVICE } from '../../../interface/constant';
import { MeetingsService } from 'sdk/module/meetings';
import { MEETING_ACTION } from 'sdk/module/meetings/types';
import { mockSingleEntity } from 'shield/application';

jest.mock('sdk/module/config');
decorate(injectable(), MeetingService);
container.bind(MEETING_SERVICE).to(MeetingService);

let meetingViewModel: MeetingViewModel;

describe('MeetingViewModel', () => {
  @testable
  class meetingGroup {
    @test('should be 1 if group id is equal to 1')
    t1() {
      meetingViewModel = new MeetingViewModel({
        groupId: 1,
      });
      expect(meetingViewModel._group).toBe(1);
    }
    @test('should be empty if doesnot input group id')
    t2() {
      expect(meetingViewModel._group).toBeNull();
    }
  }

  @testable
  class meetingShowIcon {
    @test('should be empty if doesnot input group id')
    async t1() {
      meetingViewModel = new MeetingViewModel();
      expect(meetingViewModel.showIcon.cached.value).toBe(false);
    }
  }

  @testable
  class meetingVideoCall {
    @test.only('should be true if canUseVideoCall')
    @mockSingleEntity(true)
    t1() {
      meetingViewModel = new MeetingViewModel();
      expect(meetingViewModel.canUseVideoCall).toBe(true);
    }
  }

  @testable
  class startMeeting {
    @test.only('should be openwindow if called')
    @mockService(MeetingsService, 'startMeeting', {
      action: MEETING_ACTION.DEEP_LINK,
      link: '123123',
    })
    async t1() {
      const meetingViewModel = new MeetingViewModel();
      jest.spyOn(meetingViewModel, 'openWindow').mockImplementation();
      await meetingViewModel.startMeeting();
      expect(meetingViewModel.openWindow).toHaveBeenCalled();
    }

    @test.only('should not be openwindow if link is empty')
    @mockService(MeetingsService, 'startMeeting', {
      action: MEETING_ACTION.DEEP_LINK,
      link: '',
    })
    async t2() {
      const meetingViewModel = new MeetingViewModel();
      jest.spyOn(meetingViewModel, 'openWindow').mockImplementation();
      await meetingViewModel.startMeeting();
      expect(meetingViewModel.openWindow).not.toHaveBeenCalled();
    }
  }
});
