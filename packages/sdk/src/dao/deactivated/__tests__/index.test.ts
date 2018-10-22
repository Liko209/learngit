/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-17 12:06:50
 * Copyright © RingCentral. All rights reserved.
 */
import DeactivatedDao from '../';
import { setup } from '../../__tests__/utils';

describe('Company Dao', () => {
  let deactivatedDao: DeactivatedDao;

  beforeAll(() => {
    const { database } = setup();
    deactivatedDao = new DeactivatedDao(database);
  });

  it('Save company', async () => {
    const obj = { id: 100, creator_id: 4096 };
    await deactivatedDao.put(obj);
    const result = await deactivatedDao.get(100);
    expect(result).toMatchObject(obj);
  });
});
