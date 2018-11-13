/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-07 14:24:35
 * Copyright © RingCentral. All rights reserved.
 */
import GroupConfigDao from '..';
import { setup } from '../../__tests__/utils';

describe('groupConfig Dao', async () => {
  let groupConfigDao: GroupConfigDao;

  beforeAll(() => {
    const { database } = setup();
    groupConfigDao = new GroupConfigDao(database);
  });

  describe('hasMoreRemotePost', async () => {
    it('has more because of this object does not exit', async () => {
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(123);
      expect(hasMoreRemotePost).toBe(true);
    });

    it('has more because of has_more does not exit', async () => {
      const mock = {
        id: 123,
      };
      await groupConfigDao.update(mock);
      const obj = await groupConfigDao.get(123);
      expect(obj).toEqual(mock);
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(123);
      expect(hasMoreRemotePost).toBe(true);
    });

    it('has more because of has_more is true', async () => {
      const mock = {
        id: 123,
        has_more: true,
      };
      await groupConfigDao.update(mock);
      const obj = await groupConfigDao.get(123);
      expect(obj).toEqual(mock);
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(123);
      expect(hasMoreRemotePost).toBe(true);
    });

    it('does not has more because of has_more is false', async () => {
      const mock = {
        id: 123,
        has_more: false,
      };
      await groupConfigDao.update(mock);
      const obj = await groupConfigDao.get(123);
      expect(obj).toEqual(mock);
      const hasMoreRemotePost = await groupConfigDao.hasMoreRemotePost(123);
      expect(hasMoreRemotePost).toBe(false);
    });
  });
});
