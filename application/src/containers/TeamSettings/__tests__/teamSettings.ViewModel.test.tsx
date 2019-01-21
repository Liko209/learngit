import { TeamSettingsViewModel } from '../TeamSettings.ViewModel';
import { errorHelper } from 'sdk/error';
import { Notification } from '../../Notification';
import { ToastType, ToastMessageAlign } from '../../ToastWrapper/Toast/types';
import * as utils from '@/utils/error';

describe('TeamSettingsViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Error handling', () => {
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
    it('should show leaveTeamServerErrorContent when server error occurs [JPT-931]', () => {
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(true);
      jest.spyOn(errorHelper, 'isNotNetworkError').mockReturnValue(false);
      const vm = setUp();
      vm.onLeaveTeamError(new Error(''));
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamServerErrorContent'),
      );
    });
    it('should show leaveTeamNetworkErrorContent when network error occurs [JPT-930]', () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest.spyOn(errorHelper, 'isNotNetworkError').mockReturnValue(true);
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      const vm = setUp();
      vm.onLeaveTeamError(new Error(''));
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamNetworkErrorContent'),
      );
    });
    it('should call generalErrorHandler when server error occurs', () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest.spyOn(errorHelper, 'isNotNetworkError').mockReturnValue(false);
      jest.spyOn(utils, 'generalErrorHandler').mockReturnValue(jest.fn());
      const flashToast = jest
        .spyOn(Notification, 'flashToast')
        .mockImplementation(() => {});
      const vm = setUp();
      const err = new Error('');
      vm.onLeaveTeamError(err);
      expect(flashToast).not.toBeCalled();
      expect(utils.generalErrorHandler).toBeCalledWith(err);
    });
  });
});
