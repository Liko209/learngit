/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-24 20:02:06
 * Copyright © RingCentral. All rights reserved.
 */

import { IGlobalConfigService } from './IGlobalConfigService';

interface IUserConfigService extends IGlobalConfigService {
  setUserId(ns: string): void;
}

export { IUserConfigService };
