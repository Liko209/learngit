/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogDao } from '../CallLogDao';
import { CallLogViewDao } from '../CallLogViewDao';
import { daoManager, BaseDao, QUERY_DIRECTION } from 'sdk/dao';
import { CALL_LOG_SOURCE } from '../../constants';

jest.mock('sdk/dao');
jest.mock('../CallLogViewDao');

describe('CallLogDao', () => {
  let dao: CallLogDao;
  let viewDao: CallLogViewDao;
  const mockCallLog = {
    id: 'mockId',
  } as any;

  beforeEach(() => {
    viewDao = new CallLogViewDao({} as any);
    daoManager.getDao = jest.fn().mockReturnValue(viewDao);
    dao = new CallLogDao({} as any);
    dao.doInTransaction = jest.fn().mockImplementationOnce(async func => {
      await func();
    });
  });

  describe('put', () => {
    it('should put item in dao and viewDao', async () => {
      dao['_putCallLogView'] = jest.fn();

      await dao.put(mockCallLog);
      expect(BaseDao.prototype.put).toBeCalled();
      expect(dao['_putCallLogView']).toBeCalled();
    });

    it('should put array in dao and viewDao', async () => {
      dao['_bulkPutCallLogView'] = jest.fn();

      await dao.put([mockCallLog]);
      expect(BaseDao.prototype.put).toBeCalled();
      expect(dao['_bulkPutCallLogView']).toBeCalled();
    });
  });

  describe('bulkPut', () => {
    it('should bulkPut array in dao and viewDao', async () => {
      dao['_bulkPutCallLogView'] = jest.fn();

      await dao.bulkPut([mockCallLog]);
      expect(BaseDao.prototype.bulkPut).toBeCalled();
      expect(dao['_bulkPutCallLogView']).toBeCalled();
    });
  });

  describe('clear', () => {
    it('should clear in dao and viewDao', async () => {
      await dao.clear();
      expect(BaseDao.prototype.clear).toBeCalled();
      expect(viewDao.clear).toBeCalled();
    });
  });

  describe('delete', () => {
    it('should delete in dao and viewDao', async () => {
      const mockKey = 'mockKey';

      await dao.delete(mockKey);
      expect(BaseDao.prototype.delete).toBeCalled();
      expect(viewDao.delete).toBeCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should bulkDelete in dao and viewDao', async () => {
      const mockKeys = ['mockKey'];
      await dao.bulkDelete(mockKeys);
      expect(BaseDao.prototype.bulkDelete).toBeCalled();
      expect(viewDao.bulkDelete).toBeCalled();
    });
  });

  describe('update', () => {
    it('should update item in dao and viewDao', async () => {
      dao['_updateCallLogView'] = jest.fn();

      await dao.update(mockCallLog);
      expect(BaseDao.prototype.update).toBeCalled();
      expect(dao['_updateCallLogView']).toBeCalled();
    });

    it('should update array in dao and viewDao', async () => {
      dao['_bulkUpdateCallLogView'] = jest.fn();

      await dao.update([mockCallLog]);
      expect(BaseDao.prototype.update).toBeCalled();
      expect(dao['_bulkUpdateCallLogView']).toBeCalled();
    });
  });

  describe('bulkUpdate', () => {
    it('should bulkUpdate array in dao and viewDao', async () => {
      dao['_bulkUpdateCallLogView'] = jest.fn();

      await dao.bulkUpdate([mockCallLog]);
      expect(BaseDao.prototype.bulkUpdate).toBeCalled();
      expect(dao['_bulkUpdateCallLogView']).toBeCalled();
    });
  });

  describe('queryCallLogs', () => {
    it('should queryCallLogs in viewDao', async () => {
      await dao.queryCallLogs(
        CALL_LOG_SOURCE.ALL,
        'mockId',
        QUERY_DIRECTION.OLDER,
        20,
      );
      expect(viewDao.queryCallLogs).toBeCalled();
    });
  });

  describe('callLogCount', () => {
    it('should get callLogCount', async () => {
      const mockCount = 24;
      dao.createQuery = jest
        .fn()
        .mockReturnValue({ count: jest.fn().mockReturnValue(mockCount) });

      expect(await dao.callLogCount()).toEqual(mockCount);
      expect(dao.createQuery).toBeCalled();
    });
  });

  describe('queryCallLogBySessionIdId', () => {
    it('should get correct call log', async () => {
      dao.createQuery = jest.fn().mockReturnValue({
        equal: jest
          .fn()
          .mockReturnValue({ first: jest.fn().mockReturnValue(mockCallLog) }),
      });

      expect(await dao.queryCallLogBySessionIdId('session')).toEqual(
        mockCallLog,
      );
      expect(dao.createQuery).toBeCalled();
    });
  });

  describe('queryOldestTimestamp', () => {
    it('should get startTime from view dao', async () => {
      const time = 12345;
      viewDao.queryOldestTimestamp = jest.fn().mockReturnValue(time);

      expect(await dao.queryOldestTimestamp()).toEqual(time);
      expect(viewDao.queryOldestTimestamp).toBeCalled();
    });
  });

  describe('_fetchCallLogsFunc', () => {
    it('should call batchGet', async () => {
      dao.batchGet = jest.fn().mockReturnValue(mockCallLog);

      expect(await dao['_fetchCallLogsFunc']([])).toEqual(mockCallLog);
      expect(dao.batchGet).toBeCalled();
    });
  });

  describe('_putCallLogView', () => {
    it('should put in viewDao', async () => {
      await dao['_putCallLogView'](mockCallLog);
      expect(viewDao.put).toBeCalled();
    });
  });

  describe('_bulkPutCallLogView', () => {
    it('should bulkPut in viewDao', async () => {
      await dao['_bulkPutCallLogView']([mockCallLog]);
      expect(viewDao.bulkPut).toBeCalled();
    });
  });

  describe('_updateCallLogView', () => {
    it('should update in viewDao', async () => {
      await dao['_updateCallLogView'](mockCallLog, true);
      expect(viewDao.update).toBeCalled();
    });
  });

  describe('_bulkUpdateCallLogView', () => {
    it('should bulkUpdate in viewDao', async () => {
      await dao['_bulkUpdateCallLogView']([mockCallLog], true);
      expect(viewDao.bulkUpdate).toBeCalled();
    });
  });
});
