/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 20:38:23
 * Copyright © RingCentral. All rights reserved.
 */
import { VoicemailViewDao } from '../VoicemailViewDao';
import { setup } from '../../../../../dao/__tests__/utils';
import { BaseDao, QUERY_DIRECTION } from 'sdk/dao';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('VoicemailViewDao', () => {
  let voicemailViewDao: VoicemailViewDao;
  function setUp() {
    const { database } = setup();
    voicemailViewDao = new VoicemailViewDao(database);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('toVoicemailView', () => {
    it('toVoicemailView', () => {
      const expectedData = {
        id: 123,
        from: { phoneNumber: '123' },
        __timestamp: 123,
      };
      const data: any = {
        ...expectedData,
        data: 'test',
        lastModifiedTime: '123123',
        to: { phoneNumber: '123', location: 'loc' },
      };
      const result = voicemailViewDao.toViewItem(data);
      expect(result).toEqual(expectedData);
    });
  });

  describe('toPartialVoicemailView', () => {
    it('toVoicemailView', () => {
      const expectedData = {
        id: 123,
        from: { phoneNumber: '123', extensionNumber: '333' },
        __timestamp: 123,
      };
      const data: any = {
        ...expectedData,
        data: 'test',
        lastModifiedTime: '123123',
        to: {
          phone: '123',
        },
        from: {
          phoneNumber: '123',
          extensionNumber: '333',
          location: 'location',
        },
        __timestamp: 123,
      };
      const result = voicemailViewDao.toPartialViewItem(data);
      expect(result).toEqual(expectedData);
    });
  });

  describe('queryVoicemails', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    const allData = [
      { id: 3, creationTime: '2013-07-16T19:00:00Z' },
      { id: 2, creationTime: '2013-07-15T19:00:00Z' },
      { id: 1, creationTime: '2013-07-14T19:00:00Z' },
    ];

    it('should return empty when can not get anchor and direction is newer', async () => {
      voicemailViewDao['get'] = jest.fn().mockResolvedValue(undefined);
      const result = await voicemailViewDao.queryVoicemails({
        limit: 10,
        direction: QUERY_DIRECTION.NEWER,
        anchorId: 1,
      });
      expect(result).toEqual([]);
    });

    it('should return empty when can not get vms from DB', async () => {
      voicemailViewDao['get'] = jest
        .fn()
        .mockResolvedValue({ id: 1, creationTime: '2013-07-14T19:00:00Z' });
      voicemailViewDao['getAll'] = jest.fn().mockResolvedValue([]);
      const result = await voicemailViewDao.queryVoicemails({
        limit: 10,
        direction: QUERY_DIRECTION.NEWER,
        anchorId: 1,
      });
      expect(result).toEqual([]);
    });

    it('should return voicemail ids sorted by its creation time', async () => {
      voicemailViewDao['get'] = jest
        .fn()
        .mockResolvedValue({ id: 1, creationTime: '2013-07-14T19:00:00Z' });
      voicemailViewDao['getAll'] = jest.fn().mockResolvedValue(allData);
      const result = await voicemailViewDao.queryVoicemails({
        limit: 10,
        direction: QUERY_DIRECTION.NEWER,
        anchorId: 1,
      });
      expect(result).toEqual([2, 3]);
    });
  });

  describe('getCollection', () => {
    it('should return collection of db', () => {
      expect(voicemailViewDao.getCollection()).toEqual(expect.anything());
    });
  });
});
