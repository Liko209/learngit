/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogDao } from '../CallLogDao';
import { CallLogViewDao } from '../CallLogViewDao';
import { daoManager, BaseDao } from 'sdk/dao';
import { CALL_LOG_SOURCE } from '../../constants';
import { setup } from 'sdk/dao/__tests__/utils';

jest.mock('../CallLogViewDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallLogDao', () => {
  let dao: CallLogDao;
  let viewDao: CallLogViewDao;
  const mockCallLog = {
    id: 'mockId',
    from: { phoneNumber: '213' },
    to: { phoneNumber: '4566' },
  } as any;

  beforeEach(() => {
    clearMocks();

    const { database } = setup();
    viewDao = new CallLogViewDao(database);
    daoManager.getDao = jest.fn().mockImplementation(x => {
      switch (x) {
        case CallLogViewDao:
          return viewDao;
        default:
          break;
      }
      return undefined;
    });

    dao = new CallLogDao(database);
  });

  describe('put', () => {
    it('should put item in dao and viewDao', async () => {
      await dao.put(mockCallLog);
      expect(viewDao.put).toHaveBeenCalled();
      expect(viewDao.toViewItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('bulkPut', () => {
    it('should bulkPut array in dao and viewDao', async () => {
      await dao.bulkPut([mockCallLog]);
      expect(viewDao.bulkPut).toHaveBeenCalled();
      expect(viewDao.toViewItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear', () => {
    it('should clear in dao and viewDao', async () => {
      await dao.clear();
      expect(viewDao.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete in dao and viewDao', async () => {
      const mockKey = 'mockKey';

      await dao.delete(mockKey);
      expect(viewDao.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('bulkDelete', () => {
    it('should bulkDelete in dao and viewDao', async () => {
      const mockKeys = ['mockKey'];
      await dao.bulkDelete(mockKeys);
      expect(viewDao.bulkDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update item in dao and viewDao', async () => {
      await dao.update(mockCallLog);
      expect(viewDao.update).toHaveBeenCalled();
      expect(viewDao.toPartialViewItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('bulkUpdate', () => {
    it('should bulkUpdate array in dao and viewDao', async () => {
      await dao.bulkUpdate([mockCallLog]);
      expect(viewDao.bulkUpdate).toHaveBeenCalled();
      expect(viewDao.toPartialViewItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('queryCallLogs', () => {
    it('should queryCallLogs in viewDao', async () => {
      await dao.queryCallLogs({});
      expect(viewDao.queryCallLogs).toHaveBeenCalledTimes(1);
    });
  });

  describe('callLogCount', () => {
    it('should get callLogCount', async () => {
      const mockCount = 24;
      dao.createQuery = jest
        .fn()
        .mockReturnValue({ count: jest.fn().mockReturnValue(mockCount) });

      expect(await dao.callLogCount()).toEqual(mockCount);
      expect(dao.createQuery).toHaveBeenCalledTimes(1);
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
