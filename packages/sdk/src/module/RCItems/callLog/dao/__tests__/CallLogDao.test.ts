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
    from: { phoneNumber: '213' },
    to: { phoneNumber: '4566' },
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
      expect(BaseDao.prototype.put).toHaveBeenCalled();
      expect(dao['_putCallLogView']).toHaveBeenCalled();
    });

    it('should put array in dao and viewDao', async () => {
      dao['_bulkPutCallLogView'] = jest.fn();

      await dao.put([mockCallLog]);
      expect(BaseDao.prototype.put).toHaveBeenCalled();
      expect(dao['_bulkPutCallLogView']).toHaveBeenCalled();
    });
  });

  describe('bulkPut', () => {
    it('should bulkPut array in dao and viewDao', async () => {
      dao['_bulkPutCallLogView'] = jest.fn();

      await dao.bulkPut([mockCallLog]);
      expect(BaseDao.prototype.bulkPut).toHaveBeenCalled();
      expect(dao['_bulkPutCallLogView']).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear in dao and viewDao', async () => {
      await dao.clear();
      expect(BaseDao.prototype.clear).toHaveBeenCalled();
      expect(viewDao.clear).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete in dao and viewDao', async () => {
      const mockKey = 'mockKey';

      await dao.delete(mockKey);
      expect(BaseDao.prototype.delete).toHaveBeenCalled();
      expect(viewDao.delete).toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should bulkDelete in dao and viewDao', async () => {
      const mockKeys = ['mockKey'];
      await dao.bulkDelete(mockKeys);
      expect(BaseDao.prototype.bulkDelete).toHaveBeenCalled();
      expect(viewDao.bulkDelete).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update item in dao and viewDao', async () => {
      dao['_updateCallLogView'] = jest.fn();

      await dao.update(mockCallLog);
      expect(BaseDao.prototype.update).toHaveBeenCalled();
      expect(dao['_updateCallLogView']).toHaveBeenCalled();
    });

    it('should update array in dao and viewDao', async () => {
      dao['_bulkUpdateCallLogView'] = jest.fn();

      await dao.update([mockCallLog]);
      expect(BaseDao.prototype.update).toHaveBeenCalled();
      expect(dao['_bulkUpdateCallLogView']).toHaveBeenCalled();
    });
  });

  describe('bulkUpdate', () => {
    it('should bulkUpdate array in dao and viewDao', async () => {
      dao['_bulkUpdateCallLogView'] = jest.fn();

      await dao.bulkUpdate([mockCallLog]);
      expect(BaseDao.prototype.bulkUpdate).toHaveBeenCalled();
      expect(dao['_bulkUpdateCallLogView']).toHaveBeenCalled();
    });
  });

  describe('queryCallLogs', () => {
    it('should queryCallLogs in viewDao', async () => {
      await dao.queryCallLogs({});
      expect(viewDao.queryCallLogs).toHaveBeenCalled();
    });
  });

  describe('callLogCount', () => {
    it('should get callLogCount', async () => {
      const mockCount = 24;
      dao.createQuery = jest
        .fn()
        .mockReturnValue({ count: jest.fn().mockReturnValue(mockCount) });

      expect(await dao.callLogCount()).toEqual(mockCount);
      expect(dao.createQuery).toHaveBeenCalled();
    });
  });

  describe('queryCallLogBySessionId', () => {
    it('should get correct call log', async () => {
      dao.createQuery = jest.fn().mockReturnValue({
        equal: jest
          .fn()
          .mockReturnValue({ first: jest.fn().mockReturnValue(mockCallLog) }),
      });

      expect(await dao.queryCallLogBySessionId('session')).toEqual(mockCallLog);
      expect(dao.createQuery).toHaveBeenCalled();
    });
  });

  describe('queryOldestTimestamp', () => {
    it('should get startTime from view dao', async () => {
      const time = 12345;
      viewDao.queryOldestTimestamp = jest.fn().mockReturnValue(time);

      expect(await dao.queryOldestTimestamp()).toEqual(time);
      expect(viewDao.queryOldestTimestamp).toHaveBeenCalled();
    });
  });

  describe('_fetchCallLogsFunc', () => {
    it('should call batchGet', async () => {
      dao.batchGet = jest.fn().mockReturnValue(mockCallLog);

      expect(await dao['_fetchCallLogsFunc']([])).toEqual(mockCallLog);
      expect(dao.batchGet).toHaveBeenCalled();
    });
  });

  describe('_putCallLogView', () => {
    it('should put in viewDao', async () => {
      await dao['_putCallLogView'](mockCallLog);
      expect(viewDao.put).toHaveBeenCalled();
    });
  });

  describe('_bulkPutCallLogView', () => {
    it('should bulkPut in viewDao', async () => {
      await dao['_bulkPutCallLogView']([mockCallLog]);
      expect(viewDao.bulkPut).toHaveBeenCalled();
    });
  });

  describe('_updateCallLogView', () => {
    it('should update in viewDao', async () => {
      await dao['_updateCallLogView'](mockCallLog, true);
      expect(viewDao.update).toHaveBeenCalled();
    });
  });

  describe('_bulkUpdateCallLogView', () => {
    it('should bulkUpdate in viewDao', async () => {
      await dao['_bulkUpdateCallLogView']([mockCallLog], true);
      expect(viewDao.bulkUpdate).toHaveBeenCalled();
    });
  });

  describe('queryAllUniquePhoneNumberCalls', () => {
    it('should call with right parameters', async () => {
      const result = [{ id: '1' }];
      viewDao.getAllUniquePhoneNumberCalls = jest
        .fn()
        .mockResolvedValue(result);

      expect(
        await dao.queryAllUniquePhoneNumberCalls(CALL_LOG_SOURCE.ALL),
      ).toEqual(result);
      expect(viewDao.getAllUniquePhoneNumberCalls).toHaveBeenCalledWith(
        CALL_LOG_SOURCE.ALL,
      );
    });
  });
});
