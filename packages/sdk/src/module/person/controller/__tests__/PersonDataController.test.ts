/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-23 13:23:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PersonDataController } from '../PersonDataController';
import { rawPersonFactory } from '../../../../__tests__/factories';
import { SYNC_SOURCE } from '../../../../module/sync';
import { EntitySourceController } from '../../../../framework/controller/impl/EntitySourceController';
import { Person } from '../../entity';
import { AccountGlobalConfig } from '../../../../module/account/config';
import notificationCenter from '../../../../service/notificationCenter';

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

  it('should not emit notification when handle index data', async () => {
    await personDataController.handleIncomingData([
      rawPersonFactory.build({ _id: 1 }, SYNC_SOURCE.REMAINING),
    ]);
    expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledTimes(1);
  });
});
