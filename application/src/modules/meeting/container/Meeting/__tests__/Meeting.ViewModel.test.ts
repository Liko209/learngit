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
      expect(meetingViewModel._group).toEqual(expect.objectContaining({
        id: 1
      }));
    }
    @test('should be empty if doesnot input group id')
    t2() {
      meetingViewModel = new MeetingViewModel();
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
    @test('should be true if canUseVideoCall')
    @mockSingleEntity(true)
    t1() {
      meetingViewModel = new MeetingViewModel();
      expect(meetingViewModel.canUseVideoCall).toBe(true);
    }
  }

  @testable
  class startMeeting {
    @test('should be openwindow if called')
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

    @test('should not be openwindow if link is empty')
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

  @testable
  class openWindow {
    @test('should call openWindow if openWindow is exist')
    t1() {
      const electronService = {
        openWindow: jest.fn(),
      }
      container.get = jest.fn().mockReturnValue(electronService);
      Object.defineProperty(window, 'jupiterElectron', {
        writable: true,
        value: {
          openWindow: jest.fn()
        }
      })
      meetingViewModel = new MeetingViewModel();
      meetingViewModel.openWindow('');
      expect(electronService.openWindow).toHaveBeenCalled();
    }

    @test('should call window.open if openWindow is not exist')
    t2() {
      window.jupiterElectron = {};
      window.open = jest.fn();
      meetingViewModel = new MeetingViewModel();
      meetingViewModel.openWindow('');
      expect(window.open).toHaveBeenCalled();
    }

  }
});
