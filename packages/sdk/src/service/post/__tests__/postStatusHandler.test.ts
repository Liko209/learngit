/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-05-23 15:20:46
 */

/// <reference path="../../../__tests__/types.d.ts" />

import { PostStatusHandler } from '../postStatusHandler';
import { POST_STATUS } from '../../constants';
import { daoManager, ConfigDao, PRE_INSERT_IDS } from '../../../dao';

describe('StateService', () => {
  const statusService = new PostStatusHandler();
  const preInsertIds = statusService.getPreInsertIds();
  describe('Get status', () => {
    it('Get status from local DB', async () => {
      expect(Object.keys(preInsertIds).length).toBe(0);
    });

    it('Set pre insert id status', async () => {
      statusService.setPreInsertId(1);
      let status = preInsertIds[1];
      expect(status).toBe(POST_STATUS.INPROGRESS);
      statusService.setPreInsertId(1, POST_STATUS.SUCCESS);
      status = preInsertIds[1];
      expect(status).toBe(POST_STATUS.SUCCESS);

      statusService.setPreInsertId(1, POST_STATUS.FAIL);
      status = preInsertIds[1];
      expect(status).toBe(POST_STATUS.FAIL);
    });

    it('Check pre insert ids', async () => {
      statusService.setPreInsertId(1);
      expect(statusService.isInPreInsert(1)).toBeTruthy;

      statusService.removePreInsertId(1);
      expect(statusService.isInPreInsert(1)).toBeFalsy;
    });

    it('Remove pre insert id', async () => {
      statusService.setPreInsertId(1);
      expect(Object.keys(preInsertIds).length).toBe(1);

      statusService.removePreInsertId(1);
      expect(Object.keys(preInsertIds).length).toBe(0);
    });

    it('Sync with dao', async () => {
      const configDao = daoManager.getKVDao(ConfigDao);

      statusService.setPreInsertId(1);
      let daoPreinsertIds = configDao.get(PRE_INSERT_IDS);
      expect(daoPreinsertIds).toEqual(preInsertIds);

      statusService.removePreInsertId(1);
      daoPreinsertIds = configDao.get(PRE_INSERT_IDS);
      expect(daoPreinsertIds).toEqual(preInsertIds);

      statusService.setPreInsertId(1);
      statusService.clear();
      daoPreinsertIds = configDao.get(PRE_INSERT_IDS);
      expect(daoPreinsertIds).toEqual(statusService.getPreInsertIds());
    });
  });
});
