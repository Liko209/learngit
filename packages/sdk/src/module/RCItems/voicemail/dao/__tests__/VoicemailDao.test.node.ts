/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 20:38:15
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailDao } from '../VoicemailDao';
import { VoicemailViewDao } from '../VoicemailViewDao';
import { setup } from '../../../../../dao/__tests__/utils';
import { daoManager } from 'sdk/dao';

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
    voicemailViewDao = new VoicemailViewDao(database);
    daoManager.getDao = jest.fn().mockImplementation(x => {
      switch (x) {
        case VoicemailViewDao:
          return voicemailViewDao;
        default:
          break;
      }
      return undefined;
    });

    voicemailDao = new VoicemailDao(database);
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
      expect(voicemailViewDao.put).toHaveBeenCalled();
    });
  });

  describe('bulkPut', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.bulkPut([data]);
      expect(voicemailViewDao.bulkPut).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.update(data);
      expect(voicemailViewDao.update).toHaveBeenCalled();
    });
  });

  describe('bulkUpdate', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.bulkUpdate([data]);
      expect(voicemailViewDao.bulkUpdate).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.delete(data.id);
      expect(voicemailViewDao.delete).toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.bulkDelete([data.id]);
      expect(voicemailViewDao.bulkDelete).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should do in both dao and view dao ', async () => {
      await voicemailDao.clear();
      expect(voicemailViewDao.clear).toHaveBeenCalled();
    });
  });

  describe('queryVoicemails', () => {
    it('should call view dao to get sorted ids ', async () => {
      voicemailViewDao.queryVoicemails = jest.fn().mockResolvedValue([1]);
      voicemailDao['batchGet'] = jest.fn().mockResolvedValue([]);
      await voicemailDao.queryVoicemails({
        limit: 123,
        direction: 1 as any,
        anchorId: 2,
      });
      expect(voicemailViewDao.queryVoicemails).toHaveBeenCalledWith({
        limit: 123,
        direction: 1 as any,
        anchorId: 2,
      });
      expect(voicemailDao['batchGet']).toHaveBeenCalledWith([1], true);
    });
  });
});
