/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-15 14:05:59
 * Copyright © RingCentral. All rights reserved.
 */

import { IToken } from '..';

class Token implements IToken {
  timestamp: number;
  access_token?: string;
  accessTokenExpireIn: number = 1;
  refreshTokenExpireIn: number = 1;
  refreshToken?: string;

  constructor(access_token: string, refreshToken?: string) {
    this.access_token = access_token;
    this.timestamp = Date.now();
    this.refreshToken = refreshToken;
  }
}

export default Token;
