/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 10:29:34
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogViewDao } from '../CallLogViewDao';
import { CALL_LOG_SOURCE, LOCAL_INFO_TYPE } from '../../constants';
import { ArrayUtils } from 'sdk/utils/ArrayUtils';
import { setup } from 'sdk/dao/__tests__/utils';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallLogDao', () => {
  let viewDao: CallLogViewDao;
  const mockCallLog = {
    id: 'mockId',
  } as any;
  const realCall = {
    id: 'AR0QdKQxa4YozUA',
    action: 'Incoming Fax',
    direction: 'Inbound',
    duration: 32,
    extension: {
      id: 149857004,
      uri: 'https://api-xmnup.lab.nordigy.ru/restapi/v1.0/accou',
    },
    from: {
      name: 'mThor QA account',
      phoneNumber: '+18332120337',
      id: 'AR0QdKQxa4YozUA',
    },
    result: 'Received',
    sessionId: '13461780004',
    startTime: '2019-08-14T02:25:33.476Z',
    to: {
      name: 'Freda Song',
      phoneNumber: '+12054170105',
      extensionId: '149857004',
    },
    type: 'Fax',
    uri:
      'https://api-xmnup.lab.nordigy.ru/restapi/v1.0/account/149845004/extension/149857004/call-log/AR0QdKQxa4YozUA?view=Simple',
    __deactivated: false,
    __localInfo: 1,
    __timestamp: 1565749533476,
  };
  let fetchFunc = jest.fn().mockImplementation(ids => ids);
  beforeEach(() => {
    clearMocks();
    const { database } = setup();
    viewDao = new CallLogViewDao(database);
    fetchFunc = jest.fn().mockImplementation(ids => ids);
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
      expect(viewDao.get).toHaveBeenCalled();
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
      expect(viewDao.get).toHaveBeenCalled();
      expect(viewDao.createQuery).toHaveBeenCalled();
    });

    it('should get correct call logs', async () => {
      viewDao.get = jest.fn().mockResolvedValue(mockCallLog);
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
      expect(viewDao.get).toHaveBeenCalled();
      expect(viewDao.createQuery).toHaveBeenCalled();
      expect(ArrayUtils.sliceIdArray).toHaveBeenCalled();
      expect(fetchFunc).toHaveBeenCalled();
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
      expect(viewDao.createQuery).toHaveBeenCalled();
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
      expect(viewDao.createQuery).toHaveBeenCalled();
    });

    it('should get empty when view is invalid', async () => {
      viewDao.createQuery = jest.fn().mockReturnValue({
        orderBy: jest
          .fn()
          .mockReturnValue({ first: jest.fn().mockReturnValue(undefined) }),
      });

      expect(await viewDao.queryOldestTimestamp()).toEqual(null);
      expect(viewDao.createQuery).toHaveBeenCalled();
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
      expect(viewDao.createQuery).toHaveBeenCalled();
    });

    it('should get empty when view is invalid', async () => {
      viewDao.createQuery = jest.fn().mockReturnValue({
        orderBy: jest
          .fn()
          .mockReturnValue({ first: jest.fn().mockReturnValue(undefined) }),
      });

      expect(await viewDao.queryNewestTimestamp()).toEqual(null);
      expect(viewDao.createQuery).toHaveBeenCalled();
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

  describe('toViewItem', () => {
    it('should convert to expected call view', () => {
      expect(viewDao.toViewItem(realCall as any)).toEqual({
        __localInfo: 1,
        __timestamp: 1565749533476,
        caller: { name: 'mThor QA account', phoneNumber: '+18332120337' },
        id: 'AR0QdKQxa4YozUA',
      });
    });
  });

  describe('toPartialViewItem', () => {
    it('should convert to partial expected call view', () => {
      expect(viewDao.toPartialViewItem(realCall as any)).toEqual({
        __localInfo: 1,
        __timestamp: 1565749533476,
        caller: { name: 'mThor QA account', phoneNumber: '+18332120337' },
        id: 'AR0QdKQxa4YozUA',
      });
    });
  });

  describe('getCollection', () => {
    it('should return collection of db', () => {
      expect(viewDao.getCollection()).toEqual(expect.anything());
    });
  });
});
