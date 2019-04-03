/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-07 14:24:35
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfigDao } from '../GroupConfigDao';
import { setup } from '../../../../dao/__tests__/utils';
import { QUERY_DIRECTION } from '../../../../dao/constants';

describe('groupConfig Dao', () => {
  let groupConfigDao: GroupConfigDao;

  beforeAll(() => {
    const { database } = setup();
    groupConfigDao = new GroupConfigDao(database);
  });

  describe('hasMoreRemotePost', () => {
    it('has more because of this object does not exit', async () => {
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(
        123,
        QUERY_DIRECTION.OLDER,
      );
      expect(hasMoreRemotePost).toBe(true);
    });

    it('has more because of has_more does not exit', async () => {
      const mock = {
        id: 123,
      };
      await groupConfigDao.update(mock);
      const obj = await groupConfigDao.get(123);
      expect(obj).toEqual(mock);
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(
        123,
        QUERY_DIRECTION.OLDER,
      );
      expect(hasMoreRemotePost).toBe(true);
    });

    it('has more because of has_more is true', async () => {
      const mock = {
        id: 123,
        has_more_older: true,
      };
      await groupConfigDao.update(mock);
      const obj = await groupConfigDao.get(123);
      expect(obj).toEqual(mock);
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(
        123,
        QUERY_DIRECTION.OLDER,
      );
      expect(hasMoreRemotePost).toBe(true);
    });

    it('does not has more because of has_more is false', async () => {
      const mock = {
        id: 123,
        has_more_older: false,
      };
      await groupConfigDao.update(mock);
      const obj = await groupConfigDao.get(123);
      expect(obj).toEqual(mock);
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(
        123,
        QUERY_DIRECTION.OLDER,
      );
      expect(hasMoreRemotePost).toBe(false);
    });
  });

  describe('isNewestSaved', () => {
    it('should return false if item not exists', async () => {
      await expect(groupConfigDao.isNewestSaved(123)).resolves.toBe(false);
    });

    it('should return true', async () => {
      await groupConfigDao.update({
        id: 123,
        is_newest_saved: true,
      });
      await expect(groupConfigDao.isNewestSaved(123)).resolves.toBe(true);
    });

    it('should return false', async () => {
      await groupConfigDao.update({
        id: 123,
        is_newest_saved: false,
      });
      await expect(groupConfigDao.isNewestSaved(123)).resolves.toBe(false);
    });
  });
});
