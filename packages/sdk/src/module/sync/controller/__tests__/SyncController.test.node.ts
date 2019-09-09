/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 14:22:49
 * Copyright © RingCentral. All rights reserved.
 */

import { indexData, initialData, remainingData } from '../../../../api';
import { SyncUserConfig } from '../../config/SyncUserConfig';
import { SyncController } from '../SyncController';
import { AccountGlobalConfig } from '../../../account/config';
import { JNetworkError, ERROR_CODES_NETWORK } from '../../../../error';
import { GroupConfigService } from '../../../groupConfig';
import { PersonService } from '../../../person';
import { GroupService } from '../../../group';
import { PostService } from '../../../post';
import { ItemService } from '../../../item/service';
import { AccountService } from '../../../account';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { notificationCenter, SERVICE } from 'sdk/service';
import { SYNC_SOURCE } from '../../types';
import { DaoGlobalConfig } from 'sdk/dao/config';
import { progressManager } from 'sdk/utils/progress';

jest.mock('../../config/SyncUserConfig');

jest.mock('../../../../api');
jest.mock('../../../config');
jest.mock('../../../../module/groupConfig');
jest.mock('../../../person');
jest.mock('../../../group');
jest.mock('../../../post');
jest.mock('../../../item/service');
jest.mock('../../../../module/account/config/AccountGlobalConfig');
jest.mock('sdk/utils/progress');

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

    progressManager.newProgressBar = jest.fn().mockImplementation(() => {
      return {
        start: () => {},
        stop: () => {},
      };
    });

    syncController = new SyncController();

    groupConfigService = new GroupConfigService();

    personService = new PersonService();

    groupService = new GroupService();

    postService = new PostService();

    itemService = new ItemService();

    accountService = new AccountService(null);

    groupConfigService = new GroupConfigService();

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        let result: any = null;
        switch (serviceName) {
          case ServiceConfig.PERSON_SERVICE:
            result = personService;
            break;
          case ServiceConfig.GROUP_SERVICE:
            result = groupService;
            break;
          case ServiceConfig.POST_SERVICE:
            result = postService;
            break;
          case ServiceConfig.ITEM_SERVICE:
            result = itemService;
            break;
          case ServiceConfig.ACCOUNT_SERVICE:
            result = accountService;
            break;
          case ServiceConfig.GLOBAL_CONFIG_SERVICE:
            result = {
              get: jest.fn(),
              put: jest.fn(),
              clear: jest.fn(),
            };
            break;
          case ServiceConfig.GROUP_CONFIG_SERVICE:
            result = groupConfigService;
            break;
          case ServiceConfig.SYNC_SERVICE:
            result = { userConfig: SyncUserConfig.prototype };
            break;
          default:
            break;
        }
        return result;
      });
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
    it('should set correct syncing state when call syncData()', async () => {
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockImplementation(() => {
          expect(syncController.isDataSyncing()).toBeTruthy();
          return null;
        });
      expect(syncController.isDataSyncing()).toBeFalsy();
      await syncController.syncData();
      expect(syncController.isDataSyncing()).toBeFalsy();
    });

    it('should call _firstLogin if LAST_INDEX_TIMESTAMP is null', async () => {
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(null);
      const spy = jest.spyOn(syncController, '_firstLogin');
      await syncController.syncData();
      expect(spy).toHaveBeenCalled();
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
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledTimes(1);
    });
    it('should not call _fetchRemaining when sync index data and remaining had ever called', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      SyncUserConfig.prototype.getFetchedRemaining = jest
        .fn()
        .mockReturnValue(true);
      const spy2 = jest.spyOn(syncController, '_fetchRemaining');
      await syncController.syncData();
      expect(spy2).toHaveBeenCalledTimes(0);
    });

    it('should call fetchRemainingData when sync index data and remaining had ever called', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      SyncUserConfig.prototype.getFetchedRemaining = jest
        .fn()
        .mockReturnValue(false);
      const spy2 = jest.spyOn(syncController, 'fetchRemainingData');
      await syncController.syncData();
      expect(spy2).toHaveBeenCalledTimes(1);
    });

    it('should not call fetchRemainingData when is doing fetchRemainingData', async () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      jest.spyOn(syncController, 'fetchIndexData').mockResolvedValueOnce({});

      SyncUserConfig.prototype.getLastIndexTimestamp = jest
        .fn()
        .mockReturnValue(1);
      SyncUserConfig.prototype.getFetchedRemaining = jest
        .fn()
        .mockReturnValue(false);
      Object.assign(syncController, { _isFetchingRemaining: true });
      const spy2 = jest.spyOn(syncController, 'fetchRemainingData');
      await syncController.syncData();
      expect(spy2).toHaveBeenCalledTimes(0);
    });
  });
  describe('updateIndexTimestamp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should update timestamp when is forceUpdate', () => {
      syncController.updateIndexTimestamp(1, true);
      expect(
        SyncUserConfig.prototype.setLastIndexTimestamp,
      ).toHaveBeenCalledWith(1);
    });
    describe('update timestamp from socket', () => {
      function setUp(socktTime: any, indexTime: any) {
        SyncUserConfig.prototype.getSocketConnectedLocalTime = jest
          .fn()
          .mockReturnValueOnce(socktTime);
        SyncUserConfig.prototype.getIndexStartLocalTime = jest
          .fn()
          .mockReturnValueOnce(indexTime);
      }
      it('should not update when there is not socket connected local time', () => {
        setUp(null, 1);
        syncController.updateIndexTimestamp(10, false);
        expect(
          SyncUserConfig.prototype.setLastIndexTimestamp,
        ).not.toHaveBeenCalled();
      });
      it('should not update when socket connected local time is 0', () => {
        setUp(0, 1);
        syncController.updateIndexTimestamp(10, false);
        expect(
          SyncUserConfig.prototype.setLastIndexTimestamp,
        ).not.toHaveBeenCalled();
      });

      it('should not update when socket connected local time is larger than index time', () => {
        setUp(9, 1);
        syncController.updateIndexTimestamp(10, false);
        expect(
          SyncUserConfig.prototype.setLastIndexTimestamp,
        ).not.toHaveBeenCalled();
      });
      it('should update when socket connected local time is less than index time', () => {
        setUp(6, 8);
        syncController.updateIndexTimestamp(10, false);
        expect(
          SyncUserConfig.prototype.setLastIndexTimestamp,
        ).toHaveBeenCalledWith(10);
      });
    });
  });
  describe('_handleIncomingData', () => {
    it('should call setLastIndexTimestamp and setSocketServerHost only once when first login', async () => {
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
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
      expect(
        SyncUserConfig.prototype.setIndexSocketServerHost,
      ).toHaveBeenCalledTimes(1);
    });
    it('should not update setIndexSocketServerHost if it is not changed', async () => {
      SyncUserConfig.prototype.getLastIndexTimestamp = jest
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
      SyncUserConfig.prototype.getIndexSocketServerHost = jest
        .fn()
        .mockReturnValueOnce('aws11');
      await syncController.syncData();
      expect(
        SyncUserConfig.prototype.setLastIndexTimestamp,
      ).toHaveBeenCalledTimes(1);
      expect(
        SyncUserConfig.prototype.setIndexSocketServerHost,
      ).toHaveBeenCalledTimes(0);
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
        DaoGlobalConfig.removeDBSchemaVersion = jest.fn();
        await syncController._handle504GateWayError();
        expect(DaoGlobalConfig.removeDBSchemaVersion).toHaveBeenCalled();
      });
    });
  });

  describe('handleSocketConnectionStateChanged', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    describe('connected', () => {
      it('should call setSocketConnectedLocalTime', () => {
        SyncUserConfig.prototype.setSocketConnectedLocalTime = jest
          .fn()
          .mockImplementationOnce(() => {});
        syncController.syncData = jest.fn();
        syncController.handleSocketConnectionStateChanged({
          state: 'connected',
        });
        expect(
          SyncUserConfig.prototype.setSocketConnectedLocalTime,
        ).toHaveBeenCalled();
        expect(syncController.syncData).toHaveBeenCalled();
      });
    });
    describe('disconnected', () => {
      it('should call setSocketConnectedLocalTime when user has login', () => {
        AccountGlobalConfig.getUserDictionary = jest
          .fn()
          .mockReturnValueOnce(undefined);
        SyncUserConfig.prototype.setSocketConnectedLocalTime = jest
          .fn()
          .mockImplementationOnce(() => {});
        syncController.handleSocketConnectionStateChanged({
          state: 'disconnected',
        });
        expect(
          SyncUserConfig.prototype.setSocketConnectedLocalTime,
        ).not.toHaveBeenCalled();
      });
      it('should not call setSocketConnectedLocalTime when user has not login', () => {
        AccountGlobalConfig.getUserDictionary = jest
          .fn()
          .mockReturnValueOnce(1);
        SyncUserConfig.prototype.setSocketConnectedLocalTime = jest
          .fn()
          .mockImplementationOnce(() => {});
        syncController.handleSocketConnectionStateChanged({
          state: 'disconnected',
        });
        expect(
          SyncUserConfig.prototype.setSocketConnectedLocalTime,
        ).toHaveBeenCalledWith(0);
      });
      it('should call syncData when state is refresh', () => {
        syncController.syncData = jest.fn();
        syncController.handleSocketConnectionStateChanged({
          state: 'refresh',
        });
        expect(syncController.syncData).toHaveBeenCalled();
      });
      it('should start progressBar when state is connecting', () => {
        syncController['_progressBar'].start = jest.fn();
        syncController.handleSocketConnectionStateChanged({
          state: 'connecting',
        });
        expect(syncController['_progressBar'].start).toHaveBeenCalled();
      });
    });
  });
  describe('handleStoppingSocketEvent', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it('should call setSocketConnectedLocalTime when user has login', () => {
      AccountGlobalConfig.getUserDictionary = jest
        .fn()
        .mockReturnValueOnce(undefined);
      SyncUserConfig.prototype.setSocketConnectedLocalTime = jest
        .fn()
        .mockImplementationOnce(() => {});
      syncController.handleStoppingSocketEvent();
      expect(
        SyncUserConfig.prototype.setSocketConnectedLocalTime,
      ).not.toHaveBeenCalled();
    });
    it('should not call setSocketConnectedLocalTime when user has not login', () => {
      AccountGlobalConfig.getUserDictionary = jest.fn().mockReturnValueOnce(1);
      SyncUserConfig.prototype.setSocketConnectedLocalTime = jest
        .fn()
        .mockImplementationOnce(() => {});
      syncController.handleStoppingSocketEvent();
      expect(
        SyncUserConfig.prototype.setSocketConnectedLocalTime,
      ).toHaveBeenCalledWith(0);
    });
  });

  describe('handleWakeUpFromSleep', () => {
    it('should call _resetSocketConnectedLocalTime', () => {
      syncController['_resetSocketConnectedLocalTime'] = jest.fn();
      syncController.handleWakeUpFromSleep();
      expect(
        syncController['_resetSocketConnectedLocalTime'],
      ).toHaveBeenCalled();
    });
  });

  describe('_firstLogin', () => {
    it('should notify to sign out when crash in fetch initial', async () => {
      syncController['_fetchInitial'] = jest.fn().mockImplementation(() => {
        throw 'error';
      });
      syncController['_checkFetchedRemaining'] = jest.fn();
      notificationCenter.emitKVChange = jest.fn();
      await syncController['_firstLogin']();
      expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
        SERVICE.DO_SIGN_OUT,
      );
      expect(syncController['_checkFetchedRemaining']).toHaveBeenCalled();
    });
  });

  describe('_fetchInitial', () => {
    it('should notify initial loaded and handled', async () => {
      syncController['_syncListener'] = {
        onInitialLoaded: jest.fn(),
        onInitialHandled: jest.fn(),
      };
      syncController.fetchInitialData = jest.fn();
      syncController['_handleIncomingData'] = jest.fn();
      await syncController['_fetchInitial'](1);
      expect(
        syncController['_syncListener'].onInitialLoaded,
      ).toHaveBeenCalled();
      expect(
        syncController['_syncListener'].onInitialHandled,
      ).toHaveBeenCalled();
    });
  });

  describe('_checkFetchedRemaining', () => {
    it('should set _isFetchingRemaining false when crash', async () => {
      SyncUserConfig.prototype.getFetchedRemaining.mockReturnValue(false);
      syncController['_isFetchingRemaining'] = false;
      syncController['_fetchRemaining'] = jest.fn().mockImplementation(() => {
        throw 'error';
      });
      await syncController['_checkFetchedRemaining'](1);
      expect(syncController['_fetchRemaining']).toHaveBeenCalled();
      expect(syncController['_isFetchingRemaining']).toBeFalsy();
    });
  });

  describe('_fetchRemaining', () => {
    it('should notify remaining loaded and handled', async () => {
      syncController['_syncListener'] = {
        onRemainingLoaded: jest.fn(),
        onRemainingHandled: jest.fn(),
      };
      syncController.fetchRemainingData = jest.fn();
      syncController['_handleIncomingData'] = jest.fn();
      await syncController['_fetchRemaining'](1);
      expect(
        syncController['_syncListener'].onRemainingLoaded,
      ).toHaveBeenCalled();
      expect(
        syncController['_syncListener'].onRemainingHandled,
      ).toHaveBeenCalled();
    });
  });

  describe('_dispatchIncomingData', () => {
    it('should handle all type data', async () => {
      syncController['_handleIncomingCompany'] = jest.fn();
      syncController['_handleIncomingItem'] = jest.fn();
      syncController['_handleIncomingPresence'] = jest.fn();
      syncController['_handleIncomingState'] = jest.fn();
      syncController['_handleIncomingProfile'] = jest
        .fn()
        .mockReturnValue(Promise.resolve());
      syncController['_handleIncomingPerson'] = jest.fn();
      syncController['_handleIncomingGroup'] = jest.fn();
      syncController['_handleIncomingPost'] = jest.fn();
      notificationCenter.emitEntityUpdate = jest.fn();
      await syncController['_dispatchIncomingData'](
        { user_id: 123, company_id: 456 } as any,
        SYNC_SOURCE.INDEX,
      );
      expect(syncController['_handleIncomingCompany']).toHaveBeenCalled();
      expect(syncController['_handleIncomingItem']).toHaveBeenCalled();
      expect(syncController['_handleIncomingPresence']).toHaveBeenCalled();
      expect(syncController['_handleIncomingState']).toHaveBeenCalled();
      expect(syncController['_handleIncomingProfile']).toHaveBeenCalled();
      expect(syncController['_handleIncomingPerson']).toHaveBeenCalled();
      expect(syncController['_handleIncomingGroup']).toHaveBeenCalled();
      expect(syncController['_handleIncomingPost']).toHaveBeenCalled();
    });
  });
});
