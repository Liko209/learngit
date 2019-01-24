/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 14:49:20
 * Copyright © RingCentral. All rights reserved.
 */
import { TeamSettingsViewModel } from '../TeamSettings.ViewModel';
import { errorHelper } from 'sdk/error';
import * as utils from '@/utils/error';
import { GroupService } from 'sdk/module/group';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));

describe('TeamSettingsViewModel', () => {
  describe('save()', () => {
    const groupService = new GroupService();
    beforeEach(() => {
      (GroupService as any).mockImplementation(() => groupService);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should call service api with correct trimmed params，blanks entered at the beginning/end should be ignored when saved the settings [JPT-924]', async () => {
      groupService.updateTeamSetting = jest.fn();
      const vm = new TeamSettingsViewModel();
      vm.getDerivedProps({ id: 123 });
      const result = await vm.save({
        name: 'hello  ',
        description: '  Dolor nostrud laboris veniam et duis. ',
        allowMemberAddMember: true,
      });
      expect(groupService.updateTeamSetting).toHaveBeenCalledWith(123, {
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(result).toBe(true);
    });

    it('should be prompted error in flash toast (short=2s) when saving the settings failed due to network error [JPT-936]', async () => {
      groupService.updateTeamSetting = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      jest
        .spyOn(errorHelper, 'isNetworkConnectionError')
        .mockReturnValueOnce(true);
      Notification.flashToast = jest.fn();
      const vm = new TeamSettingsViewModel();
      vm.getDerivedProps({ id: 123 });
      const result = await vm.save({
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis. ',
        allowMemberAddMember: true,
      });
      expect(groupService.updateTeamSetting).toHaveBeenCalledWith(123, {
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        message: 'SorryWeWereNotAbleToSaveTheUpdate',
        messageAlign: ToastMessageAlign.LEFT,
        type: ToastType.ERROR,
      });
      expect(result).toBe(false);
    });

    it('Should be prompted error in flash toast (short=2s) when saving the settings failed due to backend error [JPT-939]', async () => {
      groupService.updateTeamSetting = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
      Notification.flashToast = jest.fn();
      const vm = new TeamSettingsViewModel();
      vm.getDerivedProps({ id: 123 });
      const result = await vm.save({
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis. ',
        allowMemberAddMember: true,
      });
      expect(groupService.updateTeamSetting).toHaveBeenCalledWith(123, {
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        message: 'SorryWeWereNotAbleToSaveTheUpdateTryAgain',
        messageAlign: ToastMessageAlign.LEFT,
        type: ToastType.ERROR,
      });
      expect(result).toBe(false);
    });
  });
});
describe('TeamSettingsViewModel', () => {
  const groupService = new GroupService();
  beforeEach(() => {
    (GroupService as any).mockImplementation(() => groupService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('Error handling', () => {
    beforeEach(() => {
      groupService.updateTeamSetting = jest
        .fn()
        .mockRejectedValueOnce(new Error());
    });
    const setUp = () => {
      return new TeamSettingsViewModel();
    };
    const toastParamsBuilder = (message: string) => {
      return {
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      };
    };
    it('should show leaveTeamServerErrorContent when server error occurs [JPT-931]', async () => {
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(true);
      jest
        .spyOn(errorHelper, 'isNetworkConnectionError')
        .mockReturnValue(false);
      const vm = setUp();
      await vm.leaveTeam();
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamServerErrorContent'),
      );
    });
    it('should show leaveTeamNetworkErrorContent when network error occurs [JPT-930]', async () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(true);
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      const vm = setUp();
      await vm.leaveTeam();
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamNetworkErrorContent'),
      );
    });
    it('should call generalErrorHandler when server error occurs', async () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest
        .spyOn(errorHelper, 'isNetworkConnectionError')
        .mockReturnValue(false);
      jest.spyOn(utils, 'generalErrorHandler').mockReturnValue(jest.fn());
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      const vm = setUp();
      await vm.leaveTeam();
      expect(flashToast).not.toBeCalled();
      expect(utils.generalErrorHandler).toHaveBeenCalled();
    });
  });
});
