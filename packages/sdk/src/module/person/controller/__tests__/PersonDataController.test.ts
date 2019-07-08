/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-23 13:23:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { PersonDataController } from '../PersonDataController';
import { rawPersonFactory } from '../../../../__tests__/factories';
import { SYNC_SOURCE } from '../../../../module/sync';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { Person } from '../../entity';
import { AccountGlobalConfig } from '../../../../module/account/config';
import notificationCenter from '../../../../service/notificationCenter';

jest.mock('foundation/src/ioc');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../../module/account/config');

jest.mock('../../../../dao', () => ({
  daoManager: {
    getDao: jest.fn(),
    observeDBInitialize: jest.fn(),
  },
}));

describe('PersonDataController', () => {
  let personDataController: PersonDataController;
  const entitySourceController = new EntitySourceController<Person>(null, null);

  function setUp() {
    const accountService = {
      userConfig: {
        getGlipUserId() {
          return 1;
        },
      },
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
    personDataController = new PersonDataController(entitySourceController);
    AccountGlobalConfig.getCurrentUserId = jest.fn();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    setUp();
  });

  it('should return directly when handle empty array', async () => {
    personDataController.handleTeamRemovedIds = jest.fn();
    await personDataController.handleIncomingData([], SYNC_SOURCE.INDEX);
    expect(personDataController.handleTeamRemovedIds).toHaveBeenCalledTimes(0);
  });

  it('should emit notification when handle index data', async () => {
    await personDataController.handleIncomingData(
      [rawPersonFactory.build({ _id: 1 })],
      SYNC_SOURCE.INDEX,
    );
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
  });

  it('should emit notification when handle remaining data', async () => {
    await personDataController.handleIncomingData(
      [rawPersonFactory.build({ _id: 1 })],
      SYNC_SOURCE.REMAINING,
    );
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
  });

  describe('_saveData', () => {
    it('should call bulk update when the data is from socket', async () => {
      entitySourceController.bulkUpdate = jest.fn();
      await personDataController._saveData(
        [],
        [rawPersonFactory.build({ _id: 1 })],
        SYNC_SOURCE.SOCKET,
      );
      expect(entitySourceController.bulkUpdate).toBeCalled();
    });
    it('should call bulk put when the data is from index', async () => {
      entitySourceController.bulkPut = jest.fn();
      await personDataController._saveData(
        [],
        [rawPersonFactory.build({ _id: 1 })],
        SYNC_SOURCE.INDEX,
      );
      expect(entitySourceController.bulkPut).toBeCalled();
    });
  });
});
