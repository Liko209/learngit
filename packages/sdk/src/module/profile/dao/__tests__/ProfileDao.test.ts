/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-14 14:11:37
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileDao } from '../';
import { setup } from '../../../../dao/__tests__/utils';
import { Profile } from '../../entity';
import { profileFactory } from '../../../../__tests__/factories';

let profileDao: ProfileDao;
describe('ProfileDao', () => {
  beforeAll(() => {
    const { database } = setup();
    profileDao = new ProfileDao(database);
  });

  it('Save Profiles', async () => {
    const profile: Profile = profileFactory.build({ id: 40975 });
    await profileDao.put(profile);
    const matchedProfile = await profileDao.get(40975);
    expect(matchedProfile).toMatchObject(profile);
  });
});
