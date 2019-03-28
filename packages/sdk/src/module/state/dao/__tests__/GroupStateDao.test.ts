/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-08 15:17:20
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupStateDao } from '../index';
import { setup } from '../../../../dao/__tests__/utils';

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
        toArray: jest.fn().mockReturnValue(expected),
      };
      jest.spyOn(groupStateDao, 'createQuery').mockReturnValue(query);
      const result = await groupStateDao.getAll();
      expect(result).toBe(expected);
      expect(query.toArray).toHaveBeenCalledTimes(1);
    });
  });
});
