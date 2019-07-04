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

      viewDao.createQuery = jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockReturnValue([]) });

      expect(
        await viewDao.queryCallLogs(fetchFunc, {
          callLogSource: CALL_LOG_SOURCE.ALL,
          anchorId: 'id',
        }),
      ).toEqual([]);
      expect(viewDao.get).toBeCalled();
      expect(viewDao.createQuery).toBeCalled();
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
      viewDao.createQuery = jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockReturnValue(mockViews) });

      ArrayUtils.sliceIdArray = jest.fn().mockImplementation(ids => ids);
      expect(
        await viewDao.queryCallLogs(fetchFunc, {
          callLogSource: CALL_LOG_SOURCE.ALL,
          anchorId: 'id',
        }),
      ).toEqual(['1', '3']);
      expect(viewDao.get).toBeCalled();
      expect(viewDao.createQuery).toBeCalled();
      expect(ArrayUtils.sliceIdArray).toBeCalled();
      expect(fetchFunc).toBeCalled();
    });
  });

  describe('queryAllViews', () => {
    it('should get and sort all views', async () => {
      const views = [
        { __timestamp: 422, id: 'A', __localInfo: 0 },
        { __timestamp: 2, id: 'B', __localInfo: 0 },
        { __timestamp: 2, id: 'A', __localInfo: 0 },
      ];
      viewDao.createQuery = jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockReturnValue(views) });

      const sortedView = await viewDao.queryAllViews(CALL_LOG_SOURCE.ALL);
      expect(viewDao.createQuery).toBeCalled();
      expect(sortedView[0]).toEqual(views[2]);
      expect(sortedView[1]).toEqual(views[1]);
      expect(sortedView[2]).toEqual(views[0]);
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

  describe('getAllUniquePhoneNumberCalls', () => {
    const views = [
      {
        caller: { phoneNumber: '+18885439787' },
        id: 'AMUI-5hcu6F2zUA',
        __localInfo: 0,
        __timestamp: 5,
      },
      {
        caller: { phoneNumber: '+18885439783' },
        id: 'AMUI2OaT-n78zUA',
        __localInfo: 0,
        __timestamp: 4,
      },
      {
        caller: { phoneNumber: '+18885439783', name: 'Something1 New1' },
        id: 'AMUI2knZctyGzUA',
        __localInfo: 0,
        __timestamp: 3,
      },
      {
        caller: { name: 'name' },
        id: 'AMUI2knZctyGzUA111',
        __localInfo: 0,
        __timestamp: 2,
      },
      {
        id: 'AMUI2knZctyGzUA222',
        __localInfo: 0,
        __timestamp: 1,
      },
    ];

    it('should return map has unique phone numbers', async () => {
      viewDao.createQuery = jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockReturnValue(views) });
      const result = await viewDao.getAllUniquePhoneNumberCalls(
        CALL_LOG_SOURCE.ALL,
      );
      expect(result).toEqual(
        new Map([
          ['+18885439787', { creationTime: 5, id: 'AMUI-5hcu6F2zUA' }],
          ['+18885439783', { creationTime: 4, id: 'AMUI2OaT-n78zUA' }],
        ]),
      );
    });
  });
});
