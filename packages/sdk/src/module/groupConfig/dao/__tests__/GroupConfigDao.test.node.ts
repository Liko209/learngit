/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-11-07 14:24:35
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfigDao } from '../GroupConfigDao';
import { setup } from '../../../../dao/__tests__/utils';

describe('groupConfig Dao', () => {
  let groupConfigDao: GroupConfigDao;

  beforeAll(() => {
    const { database } = setup();
    groupConfigDao = new GroupConfigDao(database);
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
