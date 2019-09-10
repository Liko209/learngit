/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-13 14:31:02
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { Profile } from '../../module/profile/entity';

class ProfileAPI extends Api {
  static basePath = '/profile';
  static requestProfileById(id: number) {
    return ProfileAPI.getDataById<Profile>(id);
  }
}

export default ProfileAPI;
