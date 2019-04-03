/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-08 15:57:10
 * Copyright © RingCentral. All rights reserved.
 */

import { StateDao } from '../index';
import { setup } from '../../../../dao/__tests__/utils';
import { myStateFactory } from '../../../../__tests__/factories';

describe('Save State', () => {
  let stateDao: StateDao;

  beforeAll(() => {
    const { database } = setup();
    stateDao = new StateDao(database);
  });

  it('Save State', async () => {
    const state = myStateFactory.build({ id: 3592486919 });
    await stateDao.put(state);
    const matchedProfile = await stateDao.get(3592486919);
    expect(matchedProfile).toMatchObject(state);
  });

  it('Get first', async () => {
    const firstItem = await stateDao.getFirst();
    expect(firstItem).toMatchObject({
      id: 3592486919,
    });

    stateDao.clear();
    const firstItem2 = await stateDao.getFirst();
    expect(firstItem2).toBeNull();
  });
});
