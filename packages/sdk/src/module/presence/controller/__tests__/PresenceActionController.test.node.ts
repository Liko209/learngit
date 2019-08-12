/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-22 15:41:54
 * Copyright © RingCentral. All rights reserved.
 */
import { PresenceActionController } from '../PresenceActionController';
import { PRESENCE, PRESENCE_REQUEST_STATUS } from '../../constant';
import PresenceAPI from 'sdk/api/glip/presence';
import { AccountService } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';

jest.mock('sdk/module/account');
jest.mock('sdk/api/glip/presence');
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
describe('PresenceActionController', () => {
  let presenceActionController: PresenceActionController;
  let accountService: AccountService;
  function setUp() {
    presenceActionController = new PresenceActionController(null);
    accountService = new AccountService();
    ServiceLoader.getInstance = jest.fn().mockImplementation(config => {
      if ((config = ServiceConfig.ACCOUNT_SERVICE)) {
        return accountService;
      }
    });
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('setPresence()', () => {
    it('should update presence when set presence', async () => {
      const normalId = 1;
      accountService.userConfig = {
        getGlipUserId: jest.fn().mockReturnValue(normalId),
      };
      const state = PRESENCE.AVAILABLE;
      const presence = {
        id: normalId,
        presence: state,
      };
      const partialModifyController =
        presenceActionController['_partialModifyController'];
      partialModifyController.updatePartially = jest
        .fn()
        .mockImplementation((p: any) => {
          expect(p.entityId).toBe(normalId);
          expect(p.preHandlePartialEntity({ id: normalId })).toEqual(presence);
          p.doUpdateEntity(presence);
        });
      await presenceActionController.setPresence(state);
      expect(partialModifyController.updatePartially).toHaveBeenCalledTimes(1);
      expect(PresenceAPI.setPresence).toHaveBeenCalledWith(presence);
    });
    it('should update presence when set presence throw an error [JPT-2558]', async (done: jest.DoneCallback) => {
      const normalId = 1;
      accountService.userConfig = {
        getGlipUserId: jest.fn().mockReturnValue(normalId),
      };
      const state = PRESENCE.AVAILABLE;
      const partialModifyController =
        presenceActionController['_partialModifyController'];
      partialModifyController.updatePartially = jest
        .fn()
        .mockRejectedValue(new Error());
      const result = presenceActionController.setPresence(state);
      await expect(result).rejects.not.toBeUndefined();
      done();
    });
  });

  describe('setAutoPresence()', () => {
    it('should call api with away when auto set unavailable', async (done: jest.DoneCallback) => {
      PresenceAPI.setAutoPresence.mockRejectedValueOnce('');
      await expect(
        presenceActionController.setAutoPresence(PRESENCE.UNAVAILABLE),
      ).resolves;
      expect(PresenceAPI.setAutoPresence).toHaveBeenCalledWith(
        PRESENCE_REQUEST_STATUS.AWAY,
      );
      done();
    });
    it('should call api with away when auto set available', async (done: jest.DoneCallback) => {
      PresenceAPI.setAutoPresence.mockRejectedValueOnce('');
      await expect(presenceActionController.setAutoPresence(PRESENCE.AVAILABLE))
        .resolves;
      expect(PresenceAPI.setAutoPresence).toHaveBeenCalledWith(
        PRESENCE_REQUEST_STATUS.ONLINE,
      );
      done();
    });
    it('should catch an error', async (done: jest.DoneCallback) => {
      PresenceAPI.setAutoPresence.mockRejectedValueOnce(new Error());
      await expect(presenceActionController.setAutoPresence(PRESENCE.AVAILABLE))
        .rejects;
      done();
    });
  });
});
