/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogViewDao } from '../CallLogViewDao';
import { CALL_LOG_SOURCE } from '../../constants';
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
        await viewDao.queryCallLogs(fetchFunc, CALL_LOG_SOURCE.ALL, 'id'),
      ).toEqual([]);
      expect(viewDao.get).toBeCalled();
    });

    it('should return [] when can not get views', async () => {
      viewDao.get = jest.fn().mockReturnValue(mockCallLog);
      viewDao.queryAllViews = jest.fn().mockReturnValue([]);

      expect(
        await viewDao.queryCallLogs(fetchFunc, CALL_LOG_SOURCE.ALL, 'id'),
      ).toEqual([]);
      expect(viewDao.get).toBeCalled();
      expect(viewDao.queryAllViews).toBeCalled();
    });

    it('should get correct call logs', async () => {
      viewDao.get = jest.fn().mockReturnValue(mockCallLog);
      const mockViews = [
        { id: '1', result: 'Missed', __source: CALL_LOG_SOURCE.ALL },
        { id: '2', result: 'Missed', __source: CALL_LOG_SOURCE.MISSED },
        { id: '3', result: 'End', __source: CALL_LOG_SOURCE.ALL },
      ];
      viewDao.queryAllViews = jest.fn().mockReturnValue(mockViews);
      ArrayUtils.sliceIdArray = jest.fn().mockImplementation(ids => ids);

      expect(
        await viewDao.queryCallLogs(fetchFunc, CALL_LOG_SOURCE.MISSED, 'id'),
      ).toEqual(['1', '2']);
      expect(viewDao.get).toBeCalled();
      expect(viewDao.queryAllViews).toBeCalled();
      expect(ArrayUtils.sliceIdArray).toBeCalled();
      expect(fetchFunc).toBeCalled();
    });
  });

  describe('queryAllViews', () => {
    it('should get and sort all views', async () => {
      const views = [
        { __timestamp: 422, id: 'A' },
        { __timestamp: 2, id: 'B' },
        { __timestamp: 2, id: 'A' },
      ];
      viewDao.createQuery = jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockReturnValue(views) });

      const sortedView = await viewDao.queryAllViews();
      expect(viewDao.createQuery).toBeCalled();
      expect(sortedView[0]).toEqual({ __timestamp: 2, id: 'A' });
      expect(sortedView[1]).toEqual({ __timestamp: 2, id: 'B' });
      expect(sortedView[2]).toEqual({ __timestamp: 422, id: 'A' });
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
