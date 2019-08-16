/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-28 14:35:04
 * Copyright © RingCentral. All rights reserved.
 */
import Api from '../api';
import { Person } from '../../module/person/entity';

class PersonAPI extends Api {
  /**
   *
   * @param {*} id  group id
   * return group or null
   */
  static basePath = '/person';
  static requestPersonById(id: number) {
    return PersonAPI.getDataById<Person>(id);
  }
  static getHeadShotUrl(headShotParam: {
    uid: number;
    headShotVersion: number;
    size: number;
    glipToken: string;
  }) {
    const { uid, headShotVersion, size, glipToken } = headShotParam;
    return `${
      this.httpConfig.glip.cacheServer
    }/headshot/${uid}/${size}/${headShotVersion}?t=${glipToken}`;
  }
}

export default PersonAPI;
