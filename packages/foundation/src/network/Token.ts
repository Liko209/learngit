/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-15 14:05:59
 * Copyright © RingCentral. All rights reserved.
 */

import { IToken } from '..';

class Token implements IToken {
  timestamp: number;
  access_token?: string;
  expires_in: number = 1;
  refresh_token_expires_in: number = 1;
  refresh_token?: string;

  constructor(access_token: string, refreshToken?: string) {
    this.access_token = access_token;
    this.timestamp = Date.now();
    this.refresh_token = refreshToken;
  }
}

export default Token;
