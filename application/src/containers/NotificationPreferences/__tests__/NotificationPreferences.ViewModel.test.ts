/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-21 14:26:26
 * Copyright © RingCentral. All rights reserved.
 */

import { NotificationPreferencesViewModel } from '../NotificationPreferences.ViewModel';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import { mockService } from 'shield/sdk/mockService';
import { GroupService } from 'sdk/module/group';
import { testable, test } from 'shield';
import { ProfileService } from 'sdk/module/profile';

const mockBackendError = new JServerError(ERROR_CODES_SERVER.GENERAL, '');
const mockNetworkError = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');

describe('NotificationPreferencesViewModel', () => {
  @testable
  class handleSubmit {
    beforeEach() {
      Notification.flashToast = jest.fn();
    }

    @test(
      'should display flash toast notification when updateConversationPreference failed for server issue [JPT-2838]',
    )
    @mockService.reject(ProfileService, [
      { method: 'getConversationPreference', data: { muted: true } },
      { method: 'updateConversationPreference', data: mockBackendError },
    ])
    async t1() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      notificationPreferencesVM.value.muted = false;
      await notificationPreferencesVM.handleSubmit();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.errorText.server',
        }),
      );
    }

    @test(
      'should display flash toast notification when updateConversationPreference failed for network issue [JPT-2837]',
    )
    @mockService.reject(ProfileService, [
      { method: 'getConversationPreference', data: { muted: true } },
      { method: 'updateConversationPreference', data: mockNetworkError },
    ])
    async t2() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      notificationPreferencesVM.value.muted = false;
      await notificationPreferencesVM.handleSubmit();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'setting.errorText.network',
        }),
      );
    }
  }

  @testable
  class _groupType {
    @mockService(ProfileService, [{ method: 'getConversationPreference' }])
    beforeEach() {}
    @test('should be team when group.is_team is true')
    @mockService(GroupService, [
      { method: 'getById', data: { is_team: true } },
      { method: 'isIndividualGroup' },
    ])
    async t1() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      expect(notificationPreferencesVM._groupType).toBe('team');
    }

    @test(
      'should be 1:1 when group.is_team is false and isIndividualGroup is true',
    )
    @mockService(GroupService, [
      { method: 'getById', data: { is_team: false } },
      { method: 'isIndividualGroup', data: true },
    ])
    async t2() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      expect(notificationPreferencesVM._groupType).toBe('1:1');
    }

    @test(
      'should be group when group.is_team is false and isIndividualGroup is false',
    )
    @mockService(GroupService, [
      { method: 'getById', data: { is_team: false } },
      { method: 'isIndividualGroup', data: false },
    ])
    async t3() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      expect(notificationPreferencesVM._groupType).toBe('group');
    }
  }

  @testable
  class audioNotificationsDisabled {
    @mockService(GroupService, [
      { method: 'getById' },
      { method: 'isIndividualGroup' },
    ])
    beforeEach() {}

    @test('should be true when muted is true')
    @mockService(ProfileService, 'getConversationPreference', { muted: true })
    async t1() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      expect(notificationPreferencesVM.soundNotificationsDisabled).toBeTruthy();
    }

    @test(
      'should be true when muted is false and desktopNotifications is false',
    )
    @mockService(ProfileService, 'getConversationPreference', {
      muted: false,
      desktopNotifications: false,
    })
    async t2() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      expect(notificationPreferencesVM.soundNotificationsDisabled).toBeTruthy();
    }

    @test(
      'should be false when muted is false and desktopNotifications is true',
    )
    @mockService(ProfileService, 'getConversationPreference', {
      muted: false,
      desktopNotifications: true,
    })
    async t3() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      expect(notificationPreferencesVM.soundNotificationsDisabled).toBeFalsy();
    }
  }

  @testable
  class handleCheckboxChange {
    @mockService(GroupService, [
      { method: 'getById' },
      { method: 'isIndividualGroup' },
    ])
    @mockService(ProfileService, 'getConversationPreference', { muted: false })
    beforeEach() {}

    @test('should be true when default is false and current is undefined')
    async t1() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      notificationPreferencesVM.handleCheckboxChange('muted')();
      expect(notificationPreferencesVM.value['muted']).toBeTruthy();
    }

    @test('should be false when default is false and current is true')
    async t2() {
      const notificationPreferencesVM = new NotificationPreferencesViewModel();
      await notificationPreferencesVM.init();
      notificationPreferencesVM.value['muted'] = true;
      notificationPreferencesVM.handleCheckboxChange('muted')();
      expect(notificationPreferencesVM.value['muted']).toBeFalsy();
    }
  }
});
