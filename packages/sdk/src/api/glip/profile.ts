/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-13 14:31:02
 * Copyright © RingCentral. All rights reserved.
 */
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { Profile, Raw } from '../../models';

class ProfileAPI extends Api {
  static basePath = '/profile';
  static requestProfileById(id: number): Promise<IResponse<Raw<Profile>>> {
    return this.getDataById(id);
  }
}

export default ProfileAPI;
