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
import _ from 'lodash';

function extractHiddenGroupIds(profile: Profile): number[] {
  const clone = Object.assign({}, profile);
  const result: number[] = [];
  Object.keys(clone).forEach((key) => {
    if (clone[key] === true) {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m) {
        result.push(Number(m[2]));
      }
    }
  });
  return result;
}

function hiddenGroupsChange(localProfile: Profile | null, transformedData: Profile[]) {
  if (localProfile && transformedData.length) {
    const localHiddenGroupIds = extractHiddenGroupIds(localProfile).sort();
    const remoteHiddenGroupIds = extractHiddenGroupIds(transformedData[0]).sort();
    if (localHiddenGroupIds.toString() !== remoteHiddenGroupIds.toString()) {
      notificationCenter.emit(SERVICE.PROFILE_HIDDEN_GROUP, localHiddenGroupIds, remoteHiddenGroupIds);
    }
  }
}

function doNotification(localProfile: Profile | null, transformedData: Profile[]) {
  if (localProfile && transformedData.length && transformedData[0].id === localProfile.id) {
    notificationCenter.emit(SERVICE.PROFILE_FAVORITE, localProfile, transformedData[0]);
  }
  hiddenGroupsChange(localProfile, transformedData);
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
export { extractHiddenGroupIds };
