/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:39:28
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from '../entity';
import { AccountUserConfig } from '../../../module/account/config';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { JSdkError } from '../../../error/sdk/JSdkError';
import { ERROR_CODES_SDK } from '../../../error/sdk/types';
import { Raw } from '../../../framework/model/Raw';
import notificationCenter from '../../../service/notificationCenter';
import { mainLogger } from 'foundation';
import { ENTITY } from '../../../service/eventKey';
import _ from 'lodash';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import { SYNC_SOURCE, ChangeModel } from '../../../module/sync/types';

class ProfileDataController {
  constructor(
    public entitySourceController: IEntitySourceController<Profile>,
  ) {}

  async profileHandleData(
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<Profile | null> {
    let result: Profile | null = null;
    if (profile) {
      if (_.isArray(profile)) {
        result = await this._handleProfile(profile[0], source, changeMap);
      } else {
        result = await this._handleProfile(profile, source, changeMap);
      }
    }
    return result;
  }

  getCurrentProfileId(): number {
    const userConfig = new AccountUserConfig();
    return userConfig.getCurrentUserProfileId();
  }

  async getProfile(): Promise<Profile> {
    const profileId = this.getCurrentProfileId();
    const profile = await this.entitySourceController.get(profileId);
    if (!profile) {
      // Current user profile not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      throw new JSdkError(
        ERROR_CODES_SDK.GENERAL,
        `ServiceError: Can not find current profile. profileId: ${profileId}`,
      );
    }
    return profile;
  }

  async isConversationHidden(groupId: number) {
    const profile = await this.getProfile();
    if (profile) {
      const key = `hide_group_${groupId}`;
      return profile[key];
    }
    return false;
  }

  async getFavoriteGroupIds() {
    const profile = await this.getProfile();
    return profile.favorite_group_ids || [];
  }

  private async _handleProfile(
    profile: Raw<Profile>,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<Profile | null> {
    try {
      if (profile) {
        const transformedData: Profile = transform(profile);
        if (transformedData) {
          await this.entitySourceController.put(transformedData);
          if (shouldEmitNotification(source)) {
            if (changeMap) {
              changeMap.set(ENTITY.PROFILE, { entities: [transformedData] });
            } else {
              notificationCenter.emitEntityUpdate(ENTITY.PROFILE, [
                transformedData,
              ]);
            }
          }
          return transformedData;
        }
      }
      return null;
    } catch (e) {
      mainLogger.warn(`handleProfile error:${e}`);
      return null;
    }
  }
}

export { ProfileDataController };
