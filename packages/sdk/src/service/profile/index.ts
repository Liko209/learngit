/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:26:57
 */
import ProfileDao from '../../dao/profile';
import ProfileAPI from '../../api/glip/profile';

import BaseService from '../../service/BaseService';
import AccountService from '../account';
import handleData from './handleData';
import { Profile } from '../../models';
import { SOCKET } from '../eventKey';

export default class ProfileService extends BaseService<Profile> {
  static serviceName = 'ProfileService';
  constructor() {
    const subscriptions = {
      [SOCKET.PROFILE]: handleData,
    };
    super(ProfileDao, ProfileAPI, handleData, subscriptions);
  }

  async getProfile(): Promise<Profile | null> {
    const accountService: AccountService = AccountService.getInstance();
    const profileId: number | null = accountService.getCurrentUserProfileId();
    if (!profileId) {
      return null;
    }
    return this.getById(profileId);
  }

  async putFavoritePost(postId: number, toBook: boolean): Promise<Profile | null> {
    const profile = await this.getProfile();

    if (profile) {
      profile.favorite_post_ids = profile.favorite_post_ids || [];
      if (toBook) {
        if (profile.favorite_post_ids.indexOf(postId) === -1) {
          profile.favorite_post_ids.push(postId);
        } else {
          return profile;
        }
      } else {
        if (profile.favorite_post_ids.indexOf(postId) !== -1) {
          profile.favorite_post_ids = profile.favorite_post_ids
            .filter((id: number) => id !== postId);
        } else {
          return profile;
        }
      }
      profile._id = profile.id;
      delete profile.id;
      const response = await ProfileAPI.putDataById<Profile>(profile._id, profile);
      if (response.data) {
        const result = await handleData([response.data]);
        if (result && result.length) {
          return result[0];
        }
      }
    }
    // error
    return null;
  }
}
