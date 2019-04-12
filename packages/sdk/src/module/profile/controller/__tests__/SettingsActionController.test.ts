/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-09 18:37:25
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingsActionController } from '../SettingsActionController';
import { Profile } from '../../entity';
import { Raw } from '../../../../framework/model';
import { SettingOption } from '../../types';
import {
  SETTING_KEYS,
  CALLING_OPTIONS,
  MOBILE_TEAM_NOTIFICATION_OPTIONS,
} from '../../constants';

describe('SettingsActionController', () => {
  let settingsActionController: SettingsActionController;
  const mockPartialModify = {
    updatePartially: jest
      .fn()
      .mockImplementation(
        async (
          entityId: number,
          preHandlePartialEntity?: (
            partialEntity: Partial<Raw<Profile>>,
            originalEntity: Profile,
          ) => Partial<Raw<Profile>>,
          doUpdateEntity?: (updatedEntity: Profile) => Promise<Profile>,
        ) => {
          let mockProfile = {
            id: entityId,
          } as any;
          if (preHandlePartialEntity) {
            mockProfile = await preHandlePartialEntity(
              mockProfile,
              mockProfile,
            );
          }
          if (doUpdateEntity) {
            await doUpdateEntity(mockProfile);
          }
        },
      ),
  } as any;
  const mockRequestController = {
    put: jest.fn(),
  } as any;
  const mockProfileDataController = {
    getCurrentProfileId: jest.fn(),
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
      expect(mockRequestController.put).toBeCalledWith({
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
});
