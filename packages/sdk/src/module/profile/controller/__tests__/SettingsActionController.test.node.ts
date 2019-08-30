/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-09 18:37:25
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingsActionController } from '../SettingsActionController';
import { SettingOption } from '../../types';
import {
  SETTING_KEYS,
  CALLING_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
  SOUNDS_TYPE,
} from '../../constants';
import { PartialUpdateParams } from 'sdk/framework/controller/interface/IPartialModifyController';

describe('SettingsActionController', () => {
  let settingsActionController: SettingsActionController;
  const mockPartialModify = {
    updatePartially: jest
      .fn()
      .mockImplementation(async (params: PartialUpdateParams<any>) => {
        const { entityId, preHandlePartialEntity, doUpdateEntity } = params;
        let mockProfile = {
          id: entityId,
        } as any;
        if (preHandlePartialEntity) {
          mockProfile = await preHandlePartialEntity(mockProfile, mockProfile);
        }
        if (doUpdateEntity) {
          await doUpdateEntity(mockProfile);
        }
      }),
  } as any;
  const mockRequestController = {
    put: jest.fn(),
  } as any;
  const mockProfileDataController = {
    getCurrentProfileId: jest.fn(),
    getLocalProfile: jest.fn(),
  } as any;

  beforeEach(() => {
    settingsActionController = new SettingsActionController(
      mockPartialModify,
      mockRequestController,
      mockProfileDataController,
    );
  });

  describe('updateSettingOptions()', () => {
    it('should call partial modify and request controller', async () => {
      const mockProfileId = 4567;
      mockProfileDataController.getCurrentProfileId.mockReturnValueOnce(
        mockProfileId,
      );
      const mockOptions: SettingOption[] = [
        {
          key: SETTING_KEYS.CALL_OPTION,
          value: CALLING_OPTIONS.RINGCENTRAL,
        },
        {
          key: SETTING_KEYS.DEFAULT_NUMBER,
          value: 45678,
        },
        {
          key: SETTING_KEYS.MOBILE_DM,
          value: true,
        },
        {
          key: SETTING_KEYS.MOBILE_TEAM,
          value: MOBILE_TEAM_NOTIFICATION_OPTIONS.FIRST_UNREAD_ONLY,
        },
        {
          key: SETTING_KEYS.MOBILE_MENTION,
          value: false,
        },
        {
          key: SETTING_KEYS.DESKTOP_NOTIFICATION,
          value: true,
        },
        {
          key: SETTING_KEYS.MAX_LEFTRAIL_GROUP,
          value: 14,
        },
      ];

      await settingsActionController.updateSettingOptions(mockOptions);
      expect(mockRequestController.put).toHaveBeenCalledWith({
        id: mockProfileId,
        [SETTING_KEYS.CALL_OPTION]: 'ringcentral',
        [SETTING_KEYS.DEFAULT_NUMBER]: 45678,
        [SETTING_KEYS.MOBILE_DM]: 1,
        [SETTING_KEYS.MOBILE_TEAM]: 'firstonly',
        [SETTING_KEYS.MOBILE_MENTION]: 0,
        [SETTING_KEYS.DESKTOP_NOTIFICATION]: true,
        [SETTING_KEYS.MAX_LEFTRAIL_GROUP]: '14',
      });
    });
  });

  describe('updateConversationPreference', () => {
    const groupId = 1;
    const notification = {
      desktop_notifications: true,
      push_notifications: '0',
      email_notifications: '0',
    };
    const audio = { id: SOUNDS_TYPE.Alert, url: '' };
    const model = {
      desktopNotifications: true,
      pushNotifications: '0',
      emailNotifications: '0',
      audioNotifications: audio,
    };
    it('should call update setting when update conversation preference first', async () => {
      settingsActionController.updateSettingOptions = jest.fn();
      mockProfileDataController.getLocalProfile = jest.fn().mockResolvedValue({
        [SETTING_KEYS.CONVERSATION_NOTIFICATION]: undefined,
        [SETTING_KEYS.CONVERSATION_AUDIO]: undefined,
      });
      await settingsActionController.updateConversationPreference(
        groupId,
        model,
      );
      expect(
        settingsActionController.updateSettingOptions,
      ).toHaveBeenLastCalledWith([
        {
          key: SETTING_KEYS.CONVERSATION_NOTIFICATION,
          value: { [groupId]: notification },
        },
        {
          key: SETTING_KEYS.CONVERSATION_AUDIO,
          value: [
            {
              gid: groupId,
              sound: SOUNDS_TYPE.Alert,
            },
          ],
        },
      ]);
    });
    it('should call update setting when update conversation preference [JPT-2815]', async () => {
      settingsActionController.updateSettingOptions = jest.fn();
      const audio2 = { gid: 2, sound: '' };
      mockProfileDataController.getLocalProfile = jest.fn().mockResolvedValue({
        [SETTING_KEYS.CONVERSATION_NOTIFICATION]: {
          [groupId]: { muted: true, desktop_notifications: false },
        },
        [SETTING_KEYS.CONVERSATION_AUDIO]: [
          { sound: SOUNDS_TYPE.Default, gid: groupId },
          audio2,
        ],
      });
      await settingsActionController.updateConversationPreference(
        groupId,
        model,
      );
      expect(
        settingsActionController.updateSettingOptions,
      ).toHaveBeenLastCalledWith([
        {
          key: SETTING_KEYS.CONVERSATION_NOTIFICATION,
          value: { [groupId]: { muted: true, ...notification } },
        },
        {
          key: SETTING_KEYS.CONVERSATION_AUDIO,
          value: [
            {
              gid: groupId,
              sound: SOUNDS_TYPE.Alert,
            },
            audio2,
          ],
        },
      ]);
    });

    it('should reject error when update fail', async () => {
      settingsActionController.updateSettingOptions = jest.fn();
      const audio2 = { gid: 2, sound: '' };
      mockProfileDataController.getLocalProfile = jest.fn().mockResolvedValue({
        [SETTING_KEYS.CONVERSATION_NOTIFICATION]: {
          [groupId]: { muted: true, desktop_notifications: false },
        },
        [SETTING_KEYS.CONVERSATION_AUDIO]: [
          { sound: SOUNDS_TYPE.Default, gid: groupId },
          audio2,
        ],
      });
      const error = '';
      settingsActionController.updateSettingOptions = jest
        .fn()
        .mockRejectedValue(error);
      await expect(
        settingsActionController.updateConversationPreference(groupId, model),
      ).rejects.toEqual(error);
    });
  });
});
