/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-22 15:41:54
 * Copyright © RingCentral. All rights reserved.
 */
import { PresenceActionController } from '../PresenceActionController';
import { PRESENCE } from '../../constant';
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
  });
});
