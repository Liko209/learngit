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
  let teamController: GroupController;
  beforeEach(() => {
    teamController = new GroupController(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    jest.clearAllMocks();
  });
  describe('getTeamActionController()', () => {
    it('should call partial modify controller', async () => {
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
    it('should get TeamPermissionController', () => {
      const result = teamController.getTeamPermissionController();
      expect(result instanceof TeamPermissionController).toBe(true);
    });
  });

  describe('getGroupActionController()', () => {
    it('should get getGroupActionController', () => {
      const result = teamController.getGroupActionController();
      expect(result instanceof GroupActionController).toBe(true);
    });
  });
});
