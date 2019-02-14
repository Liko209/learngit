/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService } from 'sdk/module/group';
import { MenuViewModel } from '../Menu.ViewModel';
import { Notification } from '@/containers/Notification';
import { JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';

jest.mock('../../../../../../../../store/utils');
jest.mock('../../../../../../../../store/index');

Notification.flashToast = jest.fn();
const groupService = {
  removeTeamMembers: jest.fn(),
};

describe('MenuViewModel', () => {
  beforeEach(() => {
    jest.spyOn(GroupService, 'getInstance').mockReturnValue(groupService);
  });
  describe('removeFromTeam()', () => {
    it('should show removeMemberNetworkError flashToast when service return NOT_NETWORK error', (done: jest.DoneCallback) => {
      const model = new MenuViewModel();
      groupService.removeTeamMembers.mockImplementation(() => {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
      });
      model.removeFromTeam();
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'removeMemberNetworkError',
          }),
        );
        done();
      },         0);
    });
    it('should show removeMemberBackendError flashToast when service return backend error', (done: jest.DoneCallback) => {
      const model = new MenuViewModel();
      groupService.removeTeamMembers.mockImplementation(() => {
        throw new JNetworkError(ERROR_CODES_NETWORK.BAD_REQUEST, '');
      });
      model.removeFromTeam();
      setTimeout(() => {
        expect(Notification.flashToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'removeMemberBackendError',
          }),
        );
        done();
      },         0);
    });
  });
});
