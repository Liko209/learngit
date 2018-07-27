/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from '../../service/notificationCenter';
import { ENTITY, SERVICE } from '../../service/eventKey';
import { daoManager } from '../../dao';
import ProfileDao from '../../dao/profile';
import { transformAll } from '../../service/utils';
import AccountService from '../account';
import { Profile, Raw } from '../../models';
import { mainLogger } from 'foundation';

function doNotification(localProfile: Profile | null, transformedData: Profile[]) {
  if (localProfile && transformedData.length && transformedData[0].id === localProfile.id) {
    notificationCenter.emit(SERVICE.PROFILE_FAVORITE, localProfile, transformedData[0]);
  }
}

const profileHandleData = async (profile: Raw<Profile>[]): Promise<Profile[] | null> => {
  if (profile.length === 0) {
    return null;
  }
  const transformedData: Profile[] = transformAll(profile);
  const profileDao = daoManager.getDao(ProfileDao);
  let localProfile: Profile | null = null;
  const accountService: AccountService = AccountService.getInstance();
  const profileId: number | null = accountService.getCurrentUserProfileId();
  if (profileId) {
    localProfile = await profileDao.get(profileId);
  }
  notificationCenter.emitEntityPut(ENTITY.PROFILE, transformedData);
  try {
    await profileDao.bulkPut(transformedData);
    doNotification(localProfile, transformedData);
    return transformedData;
  } catch (e) {
    mainLogger.warn(`----profile save/notification error------, ${e}`);
    return null;
  }
};

export default profileHandleData;
