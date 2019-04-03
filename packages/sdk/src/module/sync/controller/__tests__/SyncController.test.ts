/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

import { NewGlobalConfig } from '../../../../service/config/NewGlobalConfig';
import { indexData, initialData, remainingData } from '../../../../api';
import { SyncUserConfig } from '../../config/SyncUserConfig';
import { GlobalConfigService } from '../../../config';
import { SyncController } from '../SyncController';
import {
  AccountGlobalConfig,
  AccountUserConfig,
} from '../../../../service/account/config';
import { JNetworkError, ERROR_CODES_NETWORK } from '../../../../error';
import { GroupConfigService } from '../../../../module/groupConfig';
import { PersonService } from '../../../person';
import { GroupService } from '../../../group';
import { PostService } from '../../../post';
import { ItemService } from '../../../item/service';
import { AccountService } from '../../../../service/account/accountService';
import socketManager from '../../../../service/socket';

jest.mock('../../config/SyncUserConfig');
jest.mock('../../../../service/config/NewGlobalConfig');
jest.mock('../../../../api');
jest.mock('../../../config');
jest.mock('../../../../module/groupConfig');
jest.mock('../../../person');
jest.mock('../../../group');
jest.mock('../../../post');
jest.mock('../../../item/service');
jest.mock('../../../../service/account/config');
jest.mock('../../../../service/account/accountService');
jest.mock('../../../../service/socket');

let groupConfigService: GroupConfigService;
let personService: PersonService;
let groupService: GroupService;
let postService: PostService;
let itemService: ItemService;

describe('SyncController ', () => {
  let syncController: SyncController = null;
  let accountService: AccountService = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    syncController = new SyncController();
    GlobalConfigService.getInstance = jest.fn().mockReturnValue({
      get: jest.fn(),
      put: jest.fn(),
    });
    groupConfigService = new GroupConfigService();
    GroupConfigService.getInstance = jest
      .fn()
      .mockReturnValue(groupConfigService);

    personService = new PersonService();
    PersonService.getInstance = jest.fn().mockReturnValue(personService);

    groupService = new GroupService();
    GroupService.getInstance = jest.fn().mockReturnValue(groupService);

    postService = new PostService();
    PostService.getInstance = jest.fn().mockReturnValue(postService);

    itemService = new ItemService();
    ItemService.getInstance = jest.fn().mockReturnValue(itemService);

    accountService = new AccountService();
    AccountService.getInstance = jest.fn().mockReturnValue(accountService);
  });

  describe('getIndexTimestamp', () => {
    it('should return correct value when call', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      expect(syncController.getIndexTimestamp()).toBe(1);
    });
  });

  describe('syncData', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(null);
      const spy = jest.spyOn(syncController, '_firstLogin');
      await syncController.syncData();
      expect(spy).toBeCalled();
    });
    it('should call _syncIndexData if LAST_INDEX_TIMESTAMP is not null', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      const spy1 = jest.spyOn(syncController, '_syncIndexData');
      const spy2 = jest.spyOn(syncController, '_fetchRemaining');
      await syncController.syncData();
      expect(spy1).toBeCalled();
      expect(spy2).toBeCalledTimes(1);
    });
    it('should not call _fetchRemaining when sync index data and remaining had ever called', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      SyncUserConfig.prototype.getFetchedRemaining = jest
        .fn()
        .mockReturnValue(1);
      const spy2 = jest.spyOn(syncController, '_fetchRemaining');
      await syncController.syncData();
      expect(spy2).toBeCalledTimes(0);
    });
  });
  describe('updateIndexTimestamp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should call updateCanUpdateIndexTimeStamp when forceUpdate is true and socket is connected', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});
      socketManager.isConnected.mockReturnValueOnce(true);
      syncController.updateIndexTimestamp(1, true);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(1);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(1);
    });

    it('should not call updateCanUpdateIndexTimeStamp when forceUpdate is true but socket is not connected', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});
      socketManager.isConnected.mockReturnValueOnce(false);
      syncController.updateIndexTimestamp(1, true);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(0);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(1);
    });

    it('should not call updateCanUpdateIndexTimeStamp when forceUpdate is false', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(syncController, 'canUpdateIndexTimeStamp')
        .mockReturnValueOnce(true);
      syncController.updateIndexTimestamp(1, false);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(0);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(1);
    });

    it('should not call NewGlobalConfig.setLastIndexTimestamp when it is not forceUpdate and can not update time stamp', () => {
      jest
        .spyOn(syncController, 'updateCanUpdateIndexTimeStamp')
        .mockImplementationOnce(() => {});
      jest
        .spyOn(syncController, 'canUpdateIndexTimeStamp')
        .mockReturnValueOnce(false);
      syncController.updateIndexTimestamp(1, false);
      expect(syncController.updateCanUpdateIndexTimeStamp).toBeCalledTimes(0);
      expect(SyncUserConfig.prototype.setLastIndexTimestamp).toBeCalledTimes(0);
    });
  });
  describe('_handleIncomingData', () => {
    it('should call setLastIndexTimestamp and setSocketServerHost only once when first login', async () => {
      NewGlobalConfig.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(undefined);
      initialData.mockResolvedValueOnce({
        timestamp: 11,
        scoreboard: 'aws11',
      });
      remainingData.mockResolvedValueOnce({
        timestamp: 222,
        scoreboard: 'aws22',
      });
      jest
        .spyOn(syncController, '_dispatchIncomingData')
        .mockImplementationOnce(() => {});
      await syncController.syncData();
      expect(
        SyncUserConfig.prototype.setLastIndexTimestamp,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleNetworkChange', () => {
    describe('_onPageFocused', () => {
      it('should call _onPageFocused if network became focused', async () => {
        jest.spyOn(syncController, '_onPageFocused').mockResolvedValueOnce();
        await syncController.handleWindowFocused();
        expect(syncController._onPageFocused).toHaveBeenCalledTimes(1);
      });
      it('should call syncData if index fail last time', async () => {
        SyncUserConfig.prototype.getIndexSucceed = jest
          .fn()
          .mockReturnValue(false);
        jest.spyOn(accountService, 'isGlipLogin').mockReturnValueOnce(true);
        jest.spyOn(syncController, 'syncData').mockResolvedValueOnce();
        await syncController.handleWindowFocused();
        expect(syncController.syncData).toHaveBeenCalledTimes(1);
      });
      it('should not call syncData if index success last time', async () => {
        SyncUserConfig.prototype.getIndexSucceed = jest
          .fn()
          .mockReturnValue(true);
        jest.spyOn(syncController, 'syncData').mockResolvedValueOnce();
        await syncController.handleWindowFocused();
        expect(syncController.syncData).toHaveBeenCalledTimes(0);
      });
    });
    describe('syncData', () => {
      it('should handle 504 error when it happens', async (done: any) => {
        SyncUserConfig.prototype.getLastIndexTimestamp = jest
          .fn()
          .mockReturnValue(1);

        AccountGlobalConfig.getUserDictionary = jest
          .fn()
          .mockReturnValueOnce(1);

        indexData.mockRejectedValueOnce(
          new JNetworkError(ERROR_CODES_NETWORK.GATEWAY_TIMEOUT, ''),
        );
        jest.spyOn(syncController, '_firstLogin').mockResolvedValueOnce({});
        jest
          .spyOn(syncController, '_checkFetchedRemaining')
          .mockResolvedValueOnce({});
        jest
          .spyOn(syncController, '_handleIncomingData')
          .mockResolvedValueOnce({});
        jest
          .spyOn(syncController, '_handle504GateWayError')
          .mockResolvedValueOnce({});

        itemService.clear.mockResolvedValueOnce({});
        groupConfigService.clear.mockResolvedValueOnce({});
        groupService.clear.mockResolvedValueOnce({});
        personService.clear.mockResolvedValueOnce({});
        postService.clear.mockResolvedValueOnce({});

        await syncController.syncData();

        setTimeout(() => {
          expect(syncController._handle504GateWayError).toHaveBeenCalledTimes(
            1,
          );
          done();
        });
      });
      it('should clear data when call _handle504GateWayError', async () => {
        jest.spyOn(syncController, '_firstLogin').mockResolvedValueOnce({});

        itemService.clear.mockResolvedValueOnce({});
        groupConfigService.clear.mockResolvedValueOnce({});
        groupService.clear.mockResolvedValueOnce({});
        personService.clear.mockResolvedValueOnce({});
        postService.clear.mockResolvedValueOnce({});

        await syncController._handle504GateWayError();

        expect(itemService.clear).toHaveBeenCalledTimes(1);
        expect(postService.clear).toHaveBeenCalledTimes(1);
        expect(groupConfigService.clear).toHaveBeenCalledTimes(1);
        expect(groupService.clear).toHaveBeenCalledTimes(1);
        expect(personService.clear).toHaveBeenCalledTimes(1);
        expect(syncController._firstLogin).toHaveBeenCalledTimes(1);
      });
    });
  });
});
