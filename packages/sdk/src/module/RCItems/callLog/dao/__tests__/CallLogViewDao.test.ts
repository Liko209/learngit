/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogViewDao } from '../CallLogViewDao';
import { CALL_LOG_SOURCE, LOCAL_INFO_TYPE } from '../../constants';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';

jest.mock('sdk/dao');

describe('CallLogDao', () => {
  let viewDao: CallLogViewDao;
  const mockCallLog = {
    id: 'mockId',
  } as any;
  const fetchFunc = jest.fn().mockImplementation(ids => ids);
  beforeEach(() => {
    viewDao = new CallLogViewDao({} as any);
  });

  describe('queryCallLogs', () => {
    it('should return [] when can not get call log by anchorId', async () => {
      viewDao.get = jest.fn().mockReturnValue(undefined);

      expect(
        await viewDao.queryCallLogs(fetchFunc, {
          callLogSource: CALL_LOG_SOURCE.ALL,
          anchorId: 'id',
        }),
      ).toEqual([]);
      expect(viewDao.get).toBeCalled();
    });

    it('should return [] when can not get views', async () => {
      viewDao.get = jest.fn().mockReturnValue(mockCallLog);
      viewDao.getAll = jest.fn().mockReturnValue([]);

      expect(
        await viewDao.queryCallLogs(fetchFunc, {
          callLogSource: CALL_LOG_SOURCE.ALL,
          anchorId: 'id',
        }),
      ).toEqual([]);
      expect(viewDao.get).toBeCalled();
      expect(viewDao.getAll).toBeCalled();
    });

    it('should get correct call logs', async () => {
      viewDao.get = jest.fn().mockReturnValue(mockCallLog);
      const mockViews = [
        {
          id: '1',
          __localInfo: LOCAL_INFO_TYPE.IS_INBOUND | LOCAL_INFO_TYPE.IS_MISSED,
        },
        {
          id: '2',
          __localInfo:
            LOCAL_INFO_TYPE.IS_INBOUND |
            LOCAL_INFO_TYPE.IS_MISSED |
            LOCAL_INFO_TYPE.IS_MISSED_SOURCE,
        },
        { id: '3', __localInfo: 0 },
      ];
      viewDao.getAll = jest.fn().mockReturnValue(mockViews);
      ArrayUtils.sliceIdArray = jest.fn().mockImplementation(ids => ids);

      expect(
        await viewDao.queryCallLogs(fetchFunc, {
          callLogSource: CALL_LOG_SOURCE.ALL,
          anchorId: 'id',
        }),
      ).toEqual(['1', '3']);
      expect(viewDao.get).toBeCalled();
      expect(viewDao.getAll).toBeCalled();
      expect(ArrayUtils.sliceIdArray).toBeCalled();
      expect(fetchFunc).toBeCalled();
    });
  });

  describe('queryOldestTimestamp', () => {
    it('should get correct timestamp', async () => {
      const timestamp = 123467;
      viewDao.createQuery = jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          first: jest.fn().mockReturnValue({ __timestamp: timestamp }),
        }),
      });

      expect(await viewDao.queryOldestTimestamp()).toEqual(timestamp);
      expect(viewDao.createQuery).toBeCalled();
    });

    it('should get empty when view is invalid', async () => {
      viewDao.createQuery = jest.fn().mockReturnValue({
        orderBy: jest
          .fn()
          .mockReturnValue({ first: jest.fn().mockReturnValue(undefined) }),
      });

      expect(await viewDao.queryOldestTimestamp()).toEqual(null);
      expect(viewDao.createQuery).toBeCalled();
    });
  });

  describe('queryNewestTimestamp', () => {
    it('should get correct timestamp', async () => {
      const timestamp = 123467;
      viewDao.createQuery = jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          first: jest.fn().mockReturnValue({ __timestamp: timestamp }),
        }),
      });

      expect(await viewDao.queryNewestTimestamp()).toEqual(timestamp);
      expect(viewDao.createQuery).toBeCalled();
    });

    it('should get empty when view is invalid', async () => {
      viewDao.createQuery = jest.fn().mockReturnValue({
        orderBy: jest
          .fn()
          .mockReturnValue({ first: jest.fn().mockReturnValue(undefined) }),
      });

      expect(await viewDao.queryNewestTimestamp()).toEqual(null);
      expect(viewDao.createQuery).toBeCalled();
    });
  });
});
