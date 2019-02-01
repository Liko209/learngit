/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import notificationCenter from '../../service/notificationCenter';
import { ENTITY } from '../../service/eventKey';
import { daoManager } from '../../dao';
import ProfileDao from '../../dao/profile';
import { transform } from '../../service/utils';
import { UserConfig } from '../account/UserConfig';
import { Profile } from '../../module/profile/entity';
import { Raw } from '../../framework/model';
import _ from 'lodash';
import { mainLogger } from 'foundation';

function extractHiddenGroupIds(profile: Profile): number[] {
  const clone = Object.assign({}, profile);
  const result: number[] = [];
  Object.keys(clone).forEach((key: string) => {
    if (clone[key] === true) {
      const m = key.match(new RegExp(`(${'hide_group'})_(\\d+)`));
      if (m) {
        result.push(Number(m[2]));
      }
    }
  });
  return result;
}

const profileHandleData = async (
  profile: Raw<Profile> | null,
): Promise<Profile | null> => {
  let result: Profile | null = null;
  if (profile) {
    if (_.isArray(profile)) {
      result = await handlePartialProfileUpdate(profile[0], '');
    } else {
      result = await handlePartialProfileUpdate(profile, '');
    }
  }
  return result;
};

const handlePartialProfileUpdate = async (
  profile: Raw<Profile>,
  key: string,
): Promise<Profile | null> => {
  try {
    if (profile) {
      const transformedData: Profile = transform(profile);
      if (transformedData) {
        let localProfile: Profile | null = null;
        const profileDao = daoManager.getDao(ProfileDao);
        const profileId: number | null = UserConfig.getCurrentUserProfileId();
        if (profileId) {
          localProfile = await profileDao.get(profileId);
          if (localProfile && key) {
            const obj = {
              id: transformedData.id,
            };
            obj[key] = transformedData[key];
            await profileDao.update(obj);
            notificationCenter.emitEntityUpdate(
              ENTITY.PROFILE,
              [transformedData],
              [obj],
            );
            return transformedData;
          }
        }
        await profileDao.put(transformedData);
        notificationCenter.emitEntityUpdate(ENTITY.PROFILE, [transformedData]);
        return transformedData;
      }
    }
    return null;
  } catch (e) {
    mainLogger.warn(`handlePartialProfileUpdate error:${e}`);
    return null;
  }
};

export default profileHandleData;
export { extractHiddenGroupIds, handlePartialProfileUpdate };
