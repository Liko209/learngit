/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-06-08 11:06:00
 */

import axios from 'axios';

class LogUploadLogManager {
  private static _instance: LogUploadLogManager;

  public static instance(): LogUploadLogManager {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new this();
    return this._instance;
  }

  public doUpload(
    userInfo: {
      email: string;
      userId: string;
      clientId: string;
    },
    logInfo: object,
  ) {
    return axios({
      method: 'POST',
      url: '/log/',
      data: { userInfo, logInfo },
    });
  }
}

export default LogUploadLogManager;
