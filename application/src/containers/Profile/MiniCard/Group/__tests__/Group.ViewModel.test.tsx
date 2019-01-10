/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../store/utils';
import * as errorUtil from '@/utils/error';
import { ProfileMiniCardGroupViewModel } from '../Group.ViewModel';
import storeManager from '@/store';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';

jest.mock('../../../../../store/utils');
jest.mock('@/utils/error');

const mockData = {
  displayName: 'Group name',
  isTeam: true,
};

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
      expect(vm.group).toEqual(mockData);
    });

    it('should be get changed group entity when change group entity data [JPT-405]', () => {
      mockData.displayName = 'Group name 2';
      mockData.isTeam = false;
      expect(vm.group).toEqual(mockData);
    });

    it('should set to store after get from service successfully', (done: Function) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        getByService: jest.fn(() => Promise.resolve(mockData)),
        set: jest.fn(),
      };
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        expect(groupStore.getByService).toHaveBeenCalled();
        expect(groupStore.set).toHaveBeenCalled();
        done();
      },         500);
    });

    it('should show error toast when server response with error [JPT-694]', (done: Function) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        getByService: jest.fn(() => Promise.reject(new Error())),
        set: jest.fn(),
      };
      Notification.flashToast = jest.fn();
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        expect(groupStore.getByService).toHaveBeenCalled();
        expect(groupStore.set).not.toHaveBeenCalled();
        expect(Notification.flashToast).toHaveBeenCalledWith({
          dismissible: false,
          fullWidth: false,
          message: 'SorryWeWereNotAbleToOpenThisProfile',
          messageAlign: 'left',
          type: 'error',
        });
        done();
      },         500);
    });

    it('should show error toast when server response null [JPT-694]', (done: Function) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        getByService: jest.fn(() => Promise.resolve(null)),
        set: jest.fn(),
      };
      Notification.flashToast = jest.fn();
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(true);
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        expect(groupStore.getByService).toHaveBeenCalled();
        expect(groupStore.set).not.toHaveBeenCalled();
        expect(Notification.flashToast).toHaveBeenCalledWith({
          dismissible: false,
          fullWidth: false,
          message: 'SorryWeWereNotAbleToOpenThisProfile',
          messageAlign: 'left',
          type: 'error',
        });
        done();
      },         500);
    });

    it('should use generalErrorHandler if error is not from backend', (done: Function) => {
      (getEntity as jest.Mock).mockReturnValue({ id: 123 });
      const groupStore = {
        hasValid: jest.fn(() => false),
        getByService: jest.fn(() => Promise.reject(new Error())),
        set: jest.fn(),
      };
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValueOnce(false);
      jest.spyOn(errorUtil, 'generalErrorHandler');
      storeManager.getEntityMapStore = jest
        .fn()
        .mockReturnValueOnce(groupStore);
      vm.group;
      setTimeout(() => {
        expect(groupStore.getByService).toHaveBeenCalled();
        expect(groupStore.set).not.toHaveBeenCalled();
        expect(errorUtil.generalErrorHandler).toHaveBeenCalled();
        done();
      },         500);
    });
  });
});
