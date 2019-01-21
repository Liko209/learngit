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
    it('should show leaveTeamServerErrorContent when server error occurs', () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(true);
      jest.spyOn(errorHelper, 'isNotNetworkError').mockReturnValue(false);
      const flashToast = jest.spyOn(Notification, 'flashToast');
      const vm = setUp();
      vm.onLeaveTeamError(new Error(''));
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamServerErrorContent'),
      );
    });
    it('should show leaveTeamNetworkErrorContent when server error occurs', () => {
      jest.spyOn(errorHelper, 'isBackEndError').mockReturnValue(false);
      jest.spyOn(errorHelper, 'isNotNetworkError').mockReturnValue(true);
      const flashToast = jest.spyOn(Notification, 'flashToast');
      const vm = setUp();
      vm.onLeaveTeamError(new Error(''));
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamNetworkErrorContent'),
      );
    });
    it('should call generalErrorHandler when server error occurs', () => {
      const flashToast = jest.spyOn(Notification, 'flashToast');
      const vm = setUp();
      const err = new Error('');
      vm.onLeaveTeamError(err);
      expect(flashToast).toBeCalledWith(
        toastParamsBuilder('leaveTeamNetworkErrorContent'),
      );
      expect(flashToast).not.toBeCalled();
      expect(utils.generalErrorHandler).toBeCalledWith(err);
    });
  });
});
