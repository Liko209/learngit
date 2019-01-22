/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-18 14:18:01
 * Copyright © RingCentral. All rights reserved.
 */

import { StateFetchDataController } from '../StateFetchDataController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { GroupState } from '../../../entity';
import { DeactivatedDao } from '../../../../../dao';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';

jest.mock('../../../../../framework/controller/impl/EntitySourceController');

describe('StateFetchDataController', () => {
  let stateFetchDataController: StateFetchDataController;
  let mockEntitySourceController: EntitySourceController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );
    stateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
  });

  describe('getAllGroupStatesFromLocal', () => {
    it('should call functions with correct params', async () => {
      const ids: number[] = [];
      mockEntitySourceController.getEntitiesLocally = jest.fn();
      await stateFetchDataController.getAllGroupStatesFromLocal(ids);
      expect(mockEntitySourceController.getEntitiesLocally).toBeCalledWith(
        ids,
        false,
      );
    });
  });
  describe('getGroupStatesFromLocalWithUnread', () => {});
  describe('getMyState', () => {});
  describe('getMyStateId', () => {});
  describe('getUmiByIds', () => {});
});
