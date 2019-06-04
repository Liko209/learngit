/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-29 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { GroupService } from 'sdk/module/group';
import { generalErrorHandler } from '@/utils/error';
import { Notification } from '@/containers/Notification';
import {
  JServerError,
  JNetworkError,
  ERROR_CODES_SERVER,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import { teamActionHandler } from '../handleTeamAction';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

jest.mock('@/utils/error');

const toastParamsBuilder = (message: string) => ({
  message,
  type: ToastType.ERROR,
  messageAlign: ToastMessageAlign.LEFT,
  fullWidth: false,
  dismissible: false,
  autoHideDuration: 3000,
});

const mockBackendError = new JServerError(ERROR_CODES_SERVER.GENERAL, '');
const mockNetworkError = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');

describe('handlerTeamAction', () => {
  @testable
  class handleTeamDelete {
    @mockEntity({ isTeam: true, displayName: 'my team' })
    beforeEach() {
      Notification.flashToast = jest.fn();
    }

    @test(
      'should display error when delete team failed due to unexpected backend issue [JPT-1120]',
    )
    @mockService.reject(GroupService, 'deleteTeam', mockBackendError)
    async t1() {
      await teamActionHandler.handleTeamDelete(1);

      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.deleteTeamServerErrorContent'),
      );
    }

    @test(
      'should display error when failed to delete team due to disconnect network [JPT-1118]',
    )
    @mockService.reject(GroupService, 'deleteTeam', mockNetworkError)
    async t2() {
      await teamActionHandler.handleTeamDelete(1);

      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.deleteTeamNetworkErrorContent'),
      );
    }

    @test('should call generalErrorHandler when server error occurs')
    @mockService.reject(GroupService, 'deleteTeam', 'Async Error')
    async t3() {
      generalErrorHandler.mockImplementation().mockReturnValue(jest.fn());

      try {
        await teamActionHandler.handleTeamDelete(1);
      } catch (e) {
        expect(e).toBe('Async Error');
      }

      expect(generalErrorHandler).toHaveBeenCalled();
      expect(Notification.flashToast).not.toBeCalled();
    }
  }

  @testable
  class handleTeamArchive {
    @mockEntity({ isTeam: true, displayName: 'my team' })
    beforeEach() {
      Notification.flashToast = jest.fn();
    }

    @test(
      'should display error when failed to archive team due to unexpected backend issue [JPT-1124]',
    )
    @mockService.reject(GroupService, 'archiveTeam', mockBackendError)
    async t1() {
      await teamActionHandler.handleTeamArchive(1);

      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.archiveTeamServerErrorContent'),
      );
    }

    @test(
      'should display error when failed to archive team due to disconnect network [JPT-1123]',
    )
    @mockService.reject(GroupService, 'archiveTeam', mockNetworkError)
    async t2() {
      await teamActionHandler.handleTeamArchive(1);

      expect(Notification.flashToast).toBeCalledWith(
        toastParamsBuilder('people.prompt.archiveTeamNetworkErrorContent'),
      );
    }
  }
});
