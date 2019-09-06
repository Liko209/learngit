/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-16 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import { getGlobalValue } from '../../store/utils';
import { joinHander } from '../joinPublicTeam';
import { GroupService } from 'sdk/module/group';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../../store/utils');
jest.mock('@/containers/Notification');
jest.mock('@/containers/Dialog');
jest.mock('../goToConversation');

jest.mock('sdk/api');

jest.mock('sdk/module/group');
jest.mock('sdk/module/config');

const conversationId = 1;
const groupService: GroupService = new GroupService();

describe('joinHander()', () => {
  beforeEach(() => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
    (getGlobalValue as jest.Mock).mockImplementation(() => {});
    Notification.flashToast = jest.fn();
  });
  it("Failed to join team when it's changed to private team after user clicks the join button.[JPT-1813]", async (done: jest.DoneCallback) => {
    try {
      groupService.joinTeam = jest.fn().mockImplementationOnce(() => {
        throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
      });
      await joinHander(conversationId);
    } catch (error) {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.JoinTeamErrorForAuthIssue',
        }),
      );
      done();
    }
  });
  it('Failed to join team due to backend disconnection.[JPT-1815]', async (done: jest.DoneCallback) => {
    try {
      groupService.joinTeam.mockRejectedValueOnce(
        new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
      );
      await joinHander(conversationId);
    } catch (e) {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.JoinTeamErrorForServerIssue',
        }),
      );
      done();
    }
  });
  it('Failed to join team due to network disconnection.[JPT-1817]', async (done: jest.DoneCallback) => {
    try {
      groupService.joinTeam.mockRejectedValueOnce(
        new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK'),
      );
      await joinHander(conversationId);
    } catch (error) {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'people.prompt.JoinTeamErrorForNetworkIssue',
        }),
      );
      done();
    }
  });
});
