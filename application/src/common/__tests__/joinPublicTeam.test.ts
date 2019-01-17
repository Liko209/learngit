/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-16 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { GroupService as NGroupService } from 'sdk/module/group';
import { Notification } from '@/containers/Notification';
import { getGlobalValue } from '../../store/utils';
import { joinHander } from '../joinPublicTeam';
jest.mock('../../store/utils');
jest.mock('@/containers/Notification');
jest.mock('@/containers/Dialog');
jest.mock('../goToConversation');

jest.mock('sdk/api');
jest.mock('sdk/dao', () => jest.fn());

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));

describe('joinHander()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should display flash toast notification has message {JoinTeamAuthorizedError} when join a public team then permission changed.[JPT-722]', async (done: jest.DoneCallback) => {
    (NGroupService as jest.Mock).mockImplementation(() => {
      return {
        joinTeam: async () => {
          throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
        },
      };
    });
    Notification.flashToast = jest.fn();
    (getGlobalValue as jest.Mock).mockImplementation(() => {});
    try {
      await joinHander(1);
    } catch (error) {}
    setTimeout(() => {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'JoinTeamNotAuthorizedError',
        }),
      );
      done();
    },         0);
  });
});
