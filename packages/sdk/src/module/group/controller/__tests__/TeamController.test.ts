/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:34:27
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../TeamController';
import { Group } from '../../entity/Group';
import { TeamActionController } from '../TeamActionController';
import { Api } from '../../../../api';
import { TestDatabase } from '../../../../framework/controller/__tests__/TestTypes';
import { BaseDao, daoManager } from '../../../../dao';
import { ControllerBuilder } from '../../../../framework/controller/impl/ControllerBuilder';

jest.mock('../../../../api');

describe('TeamController', () => {
  describe('getTeamActionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call partial modify controller', async () => {
      const controllerBuilder = new ControllerBuilder<Group>();
      const teamController = new TeamController(controllerBuilder);

      const dao = new BaseDao('Post', new TestDatabase());
      jest.spyOn(daoManager, 'getDao').mockImplementationOnce(() => {
        return dao;
      });

      Object.assign(Api, {
        glipNetworkClient: null,
      });

      jest
        .spyOn(controllerBuilder, 'buildPartialModifyController')
        .mockImplementationOnce(() => {
          return undefined;
        });

      jest
        .spyOn(controllerBuilder, 'buildRequestController')
        .mockImplementationOnce(() => {
          return undefined;
        });

      jest
        .spyOn(controllerBuilder, 'buildEntitySourceController')
        .mockImplementationOnce(() => {
          return undefined;
        });

      const result = teamController.getTeamActionController();
      expect(result instanceof TeamActionController).toBe(true);
      expect(controllerBuilder.buildEntitySourceController).toBeCalledTimes(1);
      expect(controllerBuilder.buildPartialModifyController).toBeCalledTimes(1);
      expect(controllerBuilder.buildRequestController).toBeCalledTimes(1);
    });
  });
});
