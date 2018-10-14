/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-28 14:35:04
 * Copyright © RingCentral. All rights reserved.
 */
import { IResponse } from '../NetworkClient';

import Api from '../api';
import { Person, Raw } from '../../models';

class PersonAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/person';
  static requestPersonById(id: number): Promise<IResponse<Raw<Person>>> {
    return this.getDataById(id);
  }
  static getHeadShot(headShotParam: {uid: number, headShotVersion: string, size: number, glipToken: string}) {
    const { uid, headShotVersion, size, glipToken } = headShotParam;
    return `${this.httpConfig.glip.cacheServer}/headshot/${uid}/${size}/${headShotVersion}?t=${glipToken}`;
  }
}

export default PersonAPI;
