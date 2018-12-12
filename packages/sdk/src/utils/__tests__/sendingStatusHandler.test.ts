/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-11 14:44:13
 * Copyright © RingCentral. All rights reserved.
 */

import { SendingStatusHandler } from '../sendingStatusHandler';
import { daoManager, ConfigDao, PRE_INSERT_IDS } from '../../dao';
import { SENDING_STATUS } from '../../service/constants';

describe('SendingStatusHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('Get status', () => {
    const statusHandler = new SendingStatusHandler(PRE_INSERT_IDS);
    const preInsertIds = statusHandler.getPreInsertIds();

    it('Get status from local DB', async () => {
      expect(Object.keys(preInsertIds).length).toBe(0);
    });

    it('Set pre insert id status', async () => {
      statusHandler.setPreInsertId(1);
      let status = preInsertIds[1];
      expect(status).toBe(SENDING_STATUS.INPROGRESS);
      statusHandler.setPreInsertId(1, SENDING_STATUS.SUCCESS);
      status = preInsertIds[1];
      expect(status).toBe(SENDING_STATUS.SUCCESS);

      statusHandler.setPreInsertId(1, SENDING_STATUS.FAIL);
      status = preInsertIds[1];
      expect(status).toBe(SENDING_STATUS.FAIL);
    });

    it('Check pre insert ids', async () => {
      statusHandler.setPreInsertId(1);
      expect(statusHandler.isInPreInsert(1)).toBeTruthy;

      statusHandler.removePreInsertId(1);
      expect(statusHandler.isInPreInsert(1)).toBeFalsy;
    });

    it('Remove pre insert id', async () => {
      statusHandler.setPreInsertId(1);
      expect(Object.keys(preInsertIds).length).toBe(1);

      statusHandler.removePreInsertId(1);
      expect(Object.keys(preInsertIds).length).toBe(0);
    });

    it('Sync with dao', async () => {
      const configDao = daoManager.getKVDao(ConfigDao);

      statusHandler.setPreInsertId(1);
      let daoPreinsertIds = configDao.get(PRE_INSERT_IDS);
      expect(daoPreinsertIds).toEqual(preInsertIds);

      statusHandler.removePreInsertId(1);
      daoPreinsertIds = configDao.get(PRE_INSERT_IDS);
      expect(daoPreinsertIds).toEqual(preInsertIds);

      statusHandler.setPreInsertId(1);
      statusHandler.clear();
      daoPreinsertIds = configDao.get(PRE_INSERT_IDS);
      expect(daoPreinsertIds).toEqual(statusHandler.getPreInsertIds());
    });
  });

  describe('getSendingStatus()', () => {
    it('should return record status', () => {
      const statusHandler = new SendingStatusHandler(PRE_INSERT_IDS);
      statusHandler.setPreInsertId(-1, SENDING_STATUS.SUCCESS);
      statusHandler.setPreInsertId(-2, SENDING_STATUS.FAIL);
      statusHandler.setPreInsertId(-3, SENDING_STATUS.INPROGRESS);

      const ids = [-1, -2, -3];
      const expects = [
        SENDING_STATUS.SUCCESS,
        SENDING_STATUS.FAIL,
        SENDING_STATUS.INPROGRESS,
      ];
      for (let i = 0; i < ids.length; i++) {
        expect(statusHandler.getSendingStatus(ids[i])).toBe(expects[i]);
      }
    });

    it('should return SENDING_STATUS.SUCCESS when id is not in the recorded list', () => {
      const statusHandler = new SendingStatusHandler(PRE_INSERT_IDS);
      expect(statusHandler.getSendingStatus(10)).toBe(SENDING_STATUS.SUCCESS);
    });
  });
});
