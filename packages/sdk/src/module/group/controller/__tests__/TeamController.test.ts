/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:34:27
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../TeamController';
import { Group } from '../../entity/Group';
import { TeamActionController } from '../TeamActionController';
import { TeamPermissionController } from '../TeamPermissionController';
import { Api } from '../../../../api';
import { TestDatabase } from '../../../../framework/controller/__tests__/TestTypes';
import { daoManager } from '../../../../dao';
import { BaseDao } from '../../../../framework/dao';
import { buildPartialModifyController } from '../../../../framework/controller';

jest.mock('../../../../api');

describe('TeamController', () => {
  describe('getTeamActionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call partial modify controller', async () => {
      const teamController = new TeamController(undefined);

      const dao = new BaseDao('Post', new TestDatabase());
      jest.spyOn(daoManager, 'getDao').mockImplementationOnce(() => {
        return dao;
      });

      Object.assign(Api, {
        glipNetworkClient: null,
      });

      const result = teamController.getTeamActionController();
      expect(result instanceof TeamActionController).toBe(true);
    });
  });
  describe('getTeamPermissionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should get TeamPermissionController', () => {
      const teamController = new TeamController(undefined);
      const result = teamController.getTeamPermissionController();
      expect(result instanceof TeamPermissionController).toBe(true);
    });
  });
});
