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
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import {
  buildPartialModifyController,
  buildRequestController,
} from '../../../../framework/controller';

jest.mock('../../../../api');
jest.mock('../../../../framework/controller');
jest.mock('../implementation/StateFetchDataController');
jest.mock('../implementation/StateActionController');
jest.mock('../implementation/StateDataHandleController');

describe('StateController', () => {
  let stateController: StateController;
  const mockEntitySourceController = {} as IEntitySourceController;
  beforeEach(() => {
    jest.clearAllMocks();
    stateController = new StateController(mockEntitySourceController);
  });
  describe('getStateActionController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getStateActionController();
      expect(buildPartialModifyController).toBeCalledWith(
        mockEntitySourceController,
      );
      expect(buildRequestController).toBeCalledWith({
        basePath: '/save_state_partial',
        networkClient: Api.glipNetworkClient,
      });
      expect(StateFetchDataController).toBeCalledWith(
        mockEntitySourceController,
      );
      expect(StateActionController).toBeCalled();
      expect(result instanceof StateActionController).toBe(true);
    });
  });

  describe('getStateDataHandleController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getStateDataHandleController();
      expect(StateFetchDataController).toBeCalledWith(
        mockEntitySourceController,
      );
      expect(StateDataHandleController).toBeCalled();
      expect(result instanceof StateDataHandleController).toBe(true);
    });
  });

  describe('getStateFetchDataController()', () => {
    it('should call functions with correct params', () => {
      const result = stateController.getStateFetchDataController();
      expect(StateFetchDataController).toBeCalledWith(
        mockEntitySourceController,
      );
      expect(result instanceof StateFetchDataController).toBe(true);
    });
  });
});
