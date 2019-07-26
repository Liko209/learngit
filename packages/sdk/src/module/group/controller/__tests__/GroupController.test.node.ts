/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:34:27
 * Copyright © RingCentral. All rights reserved.
 */
import { Api } from '../../../../api';
import { daoManager } from '../../../../dao';
import { TestDatabase } from '../../../../framework/controller/__tests__/TestTypes';
import { BaseDao } from '../../../../framework/dao';
import { GroupActionController } from '../GroupActionController';
import { GroupController } from '../GroupController';
import { TeamPermissionController } from '../TeamPermissionController';

jest.mock('../../../../api');

describe('GroupController', () => {
  describe('getTeamActionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call partial modify controller', async () => {
      const teamController = new GroupController(undefined);

      const dao = new BaseDao('Post', new TestDatabase());
      jest.spyOn(daoManager, 'getDao').mockImplementationOnce(() => {
        return dao;
      });

      Object.assign(Api, {
        glipNetworkClient: null,
      });

      const result = teamController.getGroupActionController();
      expect(result instanceof GroupActionController).toBe(true);
    });
  });
  describe('getTeamPermissionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should get TeamPermissionController', () => {
      const teamController = new GroupController(undefined);
      const result = teamController.getTeamPermissionController();
      expect(result instanceof TeamPermissionController).toBe(true);
    });
  });
});
