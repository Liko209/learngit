/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 16:08:17
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../../../../group/entity';
import { StateDataHandleController } from '../StateDataHandleController';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { DeactivatedDao } from '../../../../../dao';
import { StateFetchDataController } from '../StateFetchDataController';
import { State, GroupState } from '../../../entity';
import { IEntityPersistentController } from '../../../../../framework/controller/interface/IEntityPersistentController';

jest.mock('../StateFetchDataController');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');

describe('StateDataHandleController', () => {
  let stateDataHandleController: StateDataHandleController;
  let mockEntitySourceController: EntitySourceController;
  let mockStateFetchDataController: StateFetchDataController;
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntitySourceController = new EntitySourceController<GroupState>(
      {} as IEntityPersistentController,
      {} as DeactivatedDao,
    );
    mockStateFetchDataController = new StateFetchDataController(
      mockEntitySourceController,
    );
    stateDataHandleController = new StateDataHandleController(
      mockEntitySourceController,
      mockStateFetchDataController,
    );
  });

  describe('handleState', () => {
    it('should do nothing when states.length === 0', async () => {
      const states: Partial<State>[] = [];
      stateDataHandleController['_transformStateData'] = jest.fn();
      stateDataHandleController['_handleTransformedState'] = jest.fn();
      await stateDataHandleController.handleState(states);
      expect(stateDataHandleController['_transformStateData']).toBeCalledTimes(
        0,
      );
      expect(
        stateDataHandleController['_handleTransformedState'],
      ).toBeCalledTimes(0);
    });
  });

  describe('handlePartialGroup', () => {
    it('should do nothing when states.length === 0', async () => {
      const groups: Partial<Group>[] = [];
      stateDataHandleController['_transformGroupData'] = jest.fn();
      stateDataHandleController['_handleTransformedState'] = jest.fn();
      await stateDataHandleController.handlePartialGroup(groups);
      expect(stateDataHandleController['_transformGroupData']).toBeCalledTimes(
        0,
      );
      expect(
        stateDataHandleController['_handleTransformedState'],
      ).toBeCalledTimes(0);
    });
  });

  describe('_transformGroupData()', () => {});
  describe('_transformStateData()', () => {});
  describe('_generateUpdatedState()', () => {});
  describe('_updateEntitiesAndDoNotification()', () => {});
});
