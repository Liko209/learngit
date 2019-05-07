/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 14:49:20
 * Copyright © RingCentral. All rights reserved.
 */
import { TeamSettingsViewModel } from '../TeamSettings.ViewModel';
import { errorHelper, JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import * as utils from '@/utils/error';
import { GroupService } from 'sdk/module/group';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));
const groupService = new GroupService();

function getNewJServerError(code: string, message: string = '') {
  return new JServerError(code, message);
}

describe('TeamSettingsViewModel', () => {
  describe('save()', () => {
    beforeEach(() => {
      ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
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
        allowMemberPost: true,
        allowMemberPin: true,
      });
      expect(groupService.updateTeamSetting).toHaveBeenCalledWith(123, {
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        permissionFlags: expect.anything(),
      });
      expect(result).toBe(true);
    });

    it('Failed to update team name because the team name exists already. [JPT-1832]', async () => {
      groupService.updateTeamSetting = jest
        .fn()
        .mockRejectedValueOnce(getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN));
      const vm = new TeamSettingsViewModel();
      vm.getDerivedProps({ id: 123 });
      const result = await vm.save({
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        allowMemberAddMember: true,
        allowMemberPost: true,
        allowMemberPin: true,
      });
      expect(result).toBe(false);
      expect(vm.nameErrorMsg).toEqual('people.prompt.alreadyTaken');
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
        allowMemberPost: true,
        allowMemberPin: true,
      });
      expect(groupService.updateTeamSetting).toHaveBeenCalledWith(123, {
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        permissionFlags: expect.anything(),
      });
      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        message: 'people.prompt.SorryWeWereNotAbleToSaveTheUpdate',
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
        allowMemberPost: true,
        allowMemberPin: true,
      });
      expect(groupService.updateTeamSetting).toHaveBeenCalledWith(123, {
        name: 'hello',
        description: 'Dolor nostrud laboris veniam et duis.',
        permissionFlags: expect.anything(),
      });
      expect(Notification.flashToast).toHaveBeenCalledWith({
        dismissible: false,
        fullWidth: false,
        message: 'people.prompt.SorryWeWereNotAbleToSaveTheUpdateTryAgain',
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
    ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('Error handling', () => {
    beforeEach(() => {
      groupService.leaveTeam = jest.fn().mockRejectedValueOnce(new Error());
      groupService.deleteTeam = jest.fn().mockRejectedValueOnce(new Error());
      groupService.archiveTeam = jest.fn().mockRejectedValueOnce(new Error());
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
        toastParamsBuilder('people.prompt.leaveTeamServerErrorContent'),
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
        toastParamsBuilder('people.prompt.leaveTeamNetworkErrorContent'),
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

    it('should display error when failed to delete team due to unexpected backend issue [JPT-1120]', async () => {
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(true);
      jest
        .spyOn(errorHelper, 'isNetworkConnectionError')
        .mockReturnValue(false);
      const vm = setUp();
      await vm.deleteTeam();
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.deleteTeamServerErrorContent'),
      );
    });
    it('should display error when failed to delete team due to disconnect network [JPT-1118]', async () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(true);
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      const vm = setUp();
      await vm.deleteTeam();
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.deleteTeamNetworkErrorContent'),
      );
    });
    it('should display error when failed to archive team due to unexpected backend issue [JPT-1124]', async () => {
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(true);
      jest
        .spyOn(errorHelper, 'isNetworkConnectionError')
        .mockReturnValue(false);
      const vm = setUp();
      await vm.archiveTeam();
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.archiveTeamServerErrorContent'),
      );
    });
    it('should display error when failed to archive team due to disconnect network [JPT-1123]', async () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest.spyOn(errorHelper, 'isNetworkConnectionError').mockReturnValue(true);
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      const vm = setUp();
      await vm.archiveTeam();
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.archiveTeamNetworkErrorContent'),
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
      await vm.deleteTeam();
      expect(flashToast).not.toBeCalled();
      expect(utils.generalErrorHandler).toHaveBeenCalled();
    });
  });
});
