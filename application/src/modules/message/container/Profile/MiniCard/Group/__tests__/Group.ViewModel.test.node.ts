/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import * as errorUtil from '@/utils/error';
import { ProfileMiniCardGroupViewModel } from '../Group.ViewModel';
import storeManager from '@/store';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';
import { GroupService } from 'sdk/module/group';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';
import { ToastMessageAlign } from '@/containers/ToastWrapper/Toast/types';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));
jest.mock('@/store/utils');
jest.mock('sdk/dao');

const mockData = {
  displayName: 'Group name',
  isTeam: true,
};
const groupService: GroupService = new GroupService();
ServiceLoader.getInstance = jest.fn().mockImplementation(type => {
  switch (type) {
    case ServiceConfig.GROUP_SERVICE:
      return groupService;
    default:
      return { userConfig: { getGlipUserId: () => 2222 } };
  }
});
const props = {
  id: 1,
};
let vm: ProfileMiniCardGroupViewModel;

describe('ProfileMiniCardGroupViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileMiniCardGroupViewModel(props);
  });

  describe('id', () => {
    it('should be get group id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('group', () => {
    it('should be get group entity when invoke class instance property group [JPT-405]', () => {
      groupService.getById = jest.fn().mockResolvedValueOnce(mockData);
      groupService.getSynchronously = jest.fn().mockResolvedValueOnce(mockData);
      expect(vm.group).toEqual(mockData);
    });

    it('should be get changed group entity when change group entity data [JPT-405]', () => {
      mockData.displayName = 'Group name 2';
      mockData.isTeam = false;
      groupService.getById = jest.fn().mockResolvedValueOnce(mockData);
      expect(vm.group).toEqual(mockData);
    });

    it('should set to store after get from service successfully', (done: jest.DoneCallback) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        set: jest.fn(),
      };
      groupService.getById = jest.fn().mockResolvedValueOnce(mockData);
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        expect(groupService.getById).toHaveBeenCalled();
        expect(groupStore.set).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should show error toast when server response with error [JPT-694]', (done: Function) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        set: jest.fn(),
      };
      groupService.getById = jest.fn().mockRejectedValueOnce(new Error());
      Notification.flashToast = jest.fn();
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        expect(groupService.getById).toHaveBeenCalled();
        expect(groupStore.set).not.toHaveBeenCalled();
        expect(Notification.flashToast).toHaveBeenCalledWith({
          dismissible: false,
          fullWidth: false,
          message: 'people.prompt.SorryWeWereNotAbleToOpenThisProfile',
          messageAlign: ToastMessageAlign.LEFT,
          type: ToastType.ERROR,
        });
        done();
      }, 0);
    });

    it('should use generalErrorHandler if error is not from backend', (done: Function) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        set: jest.fn(),
      };
      groupService.getById = jest.fn().mockRejectedValueOnce(new Error());
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(false);
      jest.spyOn(errorUtil, 'generalErrorHandler');
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        done();
        expect(groupService.getById).toHaveBeenCalled();
        expect(groupStore.set).not.toHaveBeenCalled();
        expect(errorUtil.generalErrorHandler).toHaveBeenCalled();
      }, 0);
    });
  });
});
