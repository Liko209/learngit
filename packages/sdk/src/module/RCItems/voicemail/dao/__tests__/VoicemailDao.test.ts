/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 20:38:15
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailDao } from '../VoicemailDao';
import { VoicemailViewDao } from '../VoicemailViewDao';
import { setup } from '../../../../../dao/__tests__/utils';

jest.mock('../VoicemailViewDao');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('VoicemailDao', () => {
  let voicemailDao: VoicemailDao;
  let voicemailViewDao: VoicemailViewDao;
  function setUp() {
    const { database } = setup();
    voicemailDao = new VoicemailDao(database);
    voicemailViewDao = new VoicemailViewDao(database);
    voicemailDao['_voicemailViewDao'] = voicemailViewDao;
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });
  const data: any = {
    id: 1,
    lastModifiedTime: 'lastModifiedTime',
  };

  describe('put', () => {
    it('should do in both dao and view dao', async () => {
      await voicemailDao.put(data);
      expect(voicemailViewDao.put).toBeCalled();
    });

    it('should do in both dao and view dao when is array', async () => {
      await voicemailDao.put([data]);
      expect(voicemailViewDao.bulkPut).toBeCalled();
    });
  });

  describe('bulkPut', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.put([data]);
      expect(voicemailViewDao.bulkPut).toBeCalled();
    });
  });

  describe('update', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.update(data);
      expect(voicemailViewDao.update).toBeCalled();
    });

    it('should do in both dao and view dao when is array ', async () => {
      await voicemailDao.update([data]);
      expect(voicemailViewDao.bulkUpdate).toBeCalled();
    });
  });

  describe('bulkUpdate', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.bulkUpdate([data]);
      expect(voicemailViewDao.bulkUpdate).toBeCalled();
    });
  });

  describe('delete', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.delete(data.id);
      expect(voicemailViewDao.delete).toBeCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.bulkDelete([data.id]);
      expect(voicemailViewDao.bulkDelete).toBeCalled();
    });
  });

  describe('clear', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.clear();
      expect(voicemailViewDao.clear).toBeCalled();
    });
  });

  describe('queryVoicemails', () => {
    it('should call view dao to get sorted ids ', async () => {
      voicemailViewDao.queryVoicemails = jest.fn().mockResolvedValue([1]);
      voicemailDao['batchGet'] = jest.fn().mockResolvedValue([]);
      await voicemailDao.queryVoicemails(123, 1 as any, 2);
      expect(voicemailViewDao.queryVoicemails).toBeCalledWith(123, 1 as any, 2);
      expect(voicemailDao['batchGet']).toBeCalledWith([1], true);
    });
  });
});
