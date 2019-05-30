/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 14:49:20
 * Copyright © RingCentral. All rights reserved.
 */
import { TeamSettingsViewModel } from '../TeamSettings.ViewModel';
import * as utils from '@/utils/error';
import { GroupService } from 'sdk/module/group';
import { Notification } from '@/containers/Notification';
import {
  errorHelper,
  JServerError,
  JNetworkError,
  ERROR_CODES_SERVER,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';
import { ServiceLoader } from 'sdk/module/serviceLoader';


jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));

jest.mock('@/containers/Notification');
jest.mock('@/utils/error')
const groupService = new GroupService();

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
    autoHideDuration: 3000,
  };
}

describe('TeamSettingsViewModel', () => {
  describe('save()', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn();
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
        .mockRejectedValueOnce(new JServerError(ERROR_CODES_SERVER.ALREADY_TAKEN, ''));
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

    it('Failed to update team information/settings due to network disconnection. [JPT-1821]', async () => {
      groupService.updateTeamSetting = jest
        .fn()
        .mockRejectedValueOnce(new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''));
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
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('people.prompt.SaveTeamUpdateErrorForNetworkIssue'),
      );
      expect(result).toBe(false);
    });

    it('Failed to update team information/settings due to unexpected backend issue. [JPT-1818]', async () => {
      groupService.updateTeamSetting = jest
        .fn()
        .mockRejectedValueOnce(new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'));
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
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('people.prompt.SaveTeamUpdateErrorForServerIssue'),
      );
      expect(result).toBe(false);
    });
  });
});
describe('TeamSettingsViewModel', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
    ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  const setUp = () => {
    return new TeamSettingsViewModel();
  };
  describe('Error handling', () => {
    it('should show leaveTeamServerErrorContent when server error occurs [JPT-931]', async () => {
      groupService.leaveTeam = jest
        .fn()
        .mockRejectedValueOnce(new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'));
      const vm = setUp();
      await vm.leaveTeam();
      expect(Notification.flashToast).lastCalledWith(
        toastParamsBuilder('people.prompt.leaveTeamServerErrorContent'),
      );
    });
    it('should show leaveTeamNetworkErrorContent when network error occurs [JPT-930]', async () => {
      groupService.leaveTeam = jest
        .fn()
        .mockRejectedValueOnce(new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''));
      const vm = setUp();
      await vm.leaveTeam();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('people.prompt.leaveTeamNetworkErrorContent'),
      );
    });
    it('should call generalErrorHandler when server error occurs', async () => {
      groupService.leaveTeam = jest
        .fn()
        .mockRejectedValueOnce('Async error');
      (utils.generalErrorHandler as jest.Mock).mockReturnValue(jest.fn());
      const vm = setUp();
      try {
        expect(vm.leaveTeam()).rejects.toEqual('Async error');
        expect(Notification.flashToast).not.toBeCalled();
        expect(utils.generalErrorHandler).toHaveBeenCalled();
      } catch {}
    });

    it('should display error when failed to delete team due to unexpected backend issue [JPT-1120]', async () => {
      groupService.deleteTeam = jest
        .fn()
        .mockRejectedValueOnce(new JServerError(ERROR_CODES_SERVER.GENERAL, ''));
      const vm = setUp();
      await vm.deleteTeam();
      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.deleteTeamServerErrorContent'),
      );
    });
    it('should display error when failed to delete team due to disconnect network [JPT-1118]', async () => {
      groupService.deleteTeam = jest
        .fn()
        .mockRejectedValueOnce(new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''));
      const vm = setUp();
      await vm.deleteTeam();
      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.deleteTeamNetworkErrorContent'),
      );
    });

    it('should display error when failed to archive team due to unexpected backend issue [JPT-1124]', async () => {
      groupService.archiveTeam = jest
        .fn()
        .mockRejectedValueOnce(new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'));
      const vm = setUp();
      try {
        await vm.archiveTeam();
      } catch {}
      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.archiveTeamServerErrorContent'),
      );
    });
    it('should display error when failed to archive team due to disconnect network [JPT-1123]', async () => {
      groupService.archiveTeam = jest
        .fn()
        .mockRejectedValueOnce(new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''));
      const vm = setUp();
      try {
        await vm.archiveTeam();
      } catch {}
      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.archiveTeamNetworkErrorContent'),
      );
    });
    it('should call generalErrorHandler when server error occurs', async () => {
      groupService.deleteTeam = jest
        .fn()
        .mockRejectedValueOnce('Async error');
      (utils.generalErrorHandler as jest.Mock).mockReturnValue(jest.fn());
      const vm = setUp();
      try {
        expect(vm.deleteTeam()).rejects.toEqual('Async error');
        expect(Notification.flashToast).not.toBeCalled();
        expect(utils.generalErrorHandler).toHaveBeenCalled();
      } catch {}
    });
  });
});
