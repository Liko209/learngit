/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { EditProfileViewModel } from '../EditProfile.ViewModel';
import { getEntity } from '@/store/utils';
import * as utils from '@/utils/error';
import { PersonService } from 'sdk/module/person';
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

jest.unmock('@/common/emojiHelpers/map/mapAscii');
jest.unmock('@/common/emojiHelpers/map/mapEmojiOne');
jest.unmock('@/common/emojiHelpers/map/mapUnicode');

jest.mock('sdk/module/person', () => ({
  PersonService: jest.fn(),
}));

jest.mock('@/containers/Notification');
jest.mock('@/utils/error');
jest.mock('@/store/utils');
const personService = new PersonService();

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
const personInfo = {
  firstName: 'firstName',
  lastName: 'firstName',
  homepage: 'http://1.com',
  location: 'firstName',
  jobTitle: 'firstName',
};

describe('EditProfileViewModel', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(personService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('handleEditFileName()', () => {
    it('Should show not show error when homepage validation error', async () => {
      personService.editPersonalInfo = jest
        .fn()
        .mockRejectedValueOnce(
          new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''),
        );
      (getEntity as jest.Mock).mockReturnValue({
        ...personInfo,
        homepage: '1',
      });
      const vm = new EditProfileViewModel({ id: 1 });
      vm.firstName = '0';
      await vm.handleProfileEdit();
      expect(Notification.flashToast).not.toHaveBeenCalled();
    });
    it('Should show personService.editPersonalInfo call when input blank [JPT-2650]', async () => {
      personService.editPersonalInfo = jest
        .fn()
        .mockRejectedValueOnce(
          new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''),
        );
      (getEntity as jest.Mock).mockReturnValue({
        ...personInfo,
      });
      const vm = new EditProfileViewModel({ id: 1 });
      vm.firstName = '';
      vm.lastName = '';
      vm.jobTitle = '';
      vm.homepage = '';
      vm.location = '';
      await vm.handleProfileEdit();
      expect(personService.editPersonalInfo).toHaveBeenCalled();
    });
    it('Should show not show error when info not change', async () => {
      personService.editPersonalInfo = jest
        .fn()
        .mockRejectedValueOnce(
          new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''),
        );
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      await vm.handleProfileEdit();
      expect(Notification.flashToast).not.toHaveBeenCalled();
    });
    it('Should show a flash toast after the user clicks Save button on profile edit dialog in offline mode [JPT-2675]', async () => {
      personService.editPersonalInfo = jest
        .fn()
        .mockRejectedValueOnce(
          new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, ''),
        );
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      vm.firstName = '0';
      await vm.handleProfileEdit();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('people.profile.edit.editProfileNetworkError'),
      );
    });
    it('Should show a flash toast after the user clicks Save button on profile edit dialog when backend error [JPT-2670]', async () => {
      personService.editPersonalInfo = jest
        .fn()
        .mockRejectedValueOnce(
          new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
        );
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      vm.firstName = '0';
      await vm.handleProfileEdit();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('people.profile.edit.editProfileBackendError'),
      );
    });
  });

  describe('person()', () => {
    it('Should get person info ', async () => {
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      expect(vm.person).toEqual(personInfo);
    });
  });
  describe('getUpdateInfo()', () => {
    it('Should return undefined when info not change ', async () => {
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      expect(vm.getUpdateInfo()).toEqual(undefined);
    });
    it('Should return change object when info  change  ', async () => {
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      vm.lastName = '2';
      expect(vm.getUpdateInfo()).toEqual({ last_name: '2' });
    });
  });
  describe('updateInfo()', () => {
    it('Should change firstName when call updateInfo with firstName ', async () => {
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      vm.updateInfo('firstName', '1');
      expect(vm.firstName).toEqual('1');
    });
    it('Should filter emoji when call updateInfo with firstName with emoji [JPT-2659] ', async () => {
      (getEntity as jest.Mock).mockReturnValue(personInfo);
      const vm = new EditProfileViewModel({ id: 1 });
      vm.updateInfo('firstName', '1😯');
      expect(vm.firstName).toEqual('1');
    });
    it('Should change homepageError when call updateInfo with homepage', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        ...personInfo,
      });
      const vm = new EditProfileViewModel({ id: 1 });
      vm.updateInfo('homepage', '1');
      expect(vm.homepageError).toEqual(false);
    });
  });
});
