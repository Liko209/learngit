/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 09:43:41
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-05-31 16:58:26
 */

import ProfileDao from '../';
import { setup } from '../../__tests__/utils';
import { Profile } from '../../../models';
import { profileFactory } from '../../../__tests__/factories';

let profileDao: ProfileDao;
describe('Save Profiles', () => {
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
