/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-22 15:49:29
 * Copyright © RingCentral. All rights reserved.
 */

import { Api } from '../../../../api';
import { StateController } from '../StateController';
import { StateFetchDataController } from '../implementation/StateFetchDataController';
import { StateActionController } from '../implementation/StateActionController';
import { StateDataHandleController } from '../implementation/StateDataHandleController';
import { TotalUnreadController } from '../implementation/TotalUnreadController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { buildRequestController } from '../../../../framework/controller';
import { GroupService } from '../../../group/service';

jest.mock('../../../../api');
jest.mock('../../../../framework/controller');
jest.mock('../implementation/StateFetchDataController');
jest.mock('../implementation/StateActionController');
jest.mock('../implementation/StateDataHandleController');
jest.mock('../implementation/TotalUnreadController');
jest.mock('../../../../module/group/service');

describe('StateController', () => {
  let stateController: StateController;
  const mockEntitySourceController = {} as IEntitySourceController;
  const groupService = new GroupService();
  beforeEach(() => {
    jest.clearAllMocks();
    stateController = new StateController(
      groupService,
      mockEntitySourceController,
    );
  });
  describe('getStateActionController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getStateActionController();
      expect(buildRequestController).toHaveBeenCalledWith({
        basePath: '/save_state_partial',
        networkClient: Api.glipNetworkClient,
      });
      expect(StateFetchDataController).toHaveBeenCalledWith(
        mockEntitySourceController,
      );
      expect(StateActionController).toHaveBeenCalled();
      expect(result instanceof StateActionController).toBe(true);
    });
  });

  describe('getStateDataHandleController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getStateDataHandleController();
      expect(StateActionController).toHaveBeenCalled();
      expect(StateDataHandleController).toHaveBeenCalled();
      expect(result instanceof StateDataHandleController).toBe(true);
    });
  });

  describe('getStateFetchDataController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getStateFetchDataController();
      expect(StateFetchDataController).toHaveBeenCalledWith(
        mockEntitySourceController,
      );
      expect(result instanceof StateFetchDataController).toBe(true);
    });
  });

  describe('getTotalUnreadController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getTotalUnreadController();
      expect(TotalUnreadController).toHaveBeenCalledWith(
        groupService,
        mockEntitySourceController,
      );
      expect(result instanceof TotalUnreadController).toBe(true);
    });
  });
});
