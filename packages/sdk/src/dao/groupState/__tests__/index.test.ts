/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-31 18:05:21
 * Copyright © RingCentral. All rights reserved.
 */
import GroupStateDao from '..';
import { setup } from '../../__tests__/utils';

describe('groupState Dao', () => {
  let groupStateDao: GroupStateDao;

  beforeAll(() => {
    const { database } = setup();
    groupStateDao = new GroupStateDao(database);
  });

  describe('getAll()', () => {
    it('should query', async () => {
      const expected = [];
      const query = {
        toArray: jest.fn().mockReturnValue(expected)
      };
      jest.spyOn(groupStateDao, 'createQuery').mockReturnValue(query);
      const result = await groupStateDao.getAll();
      expect(result).toBe(expected);
      expect(query.toArray).toHaveBeenCalledTimes(1);
    });
  });
});
