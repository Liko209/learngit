/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-01 16:49:01
 * Copyright © RingCentral. All rights reserved.
 */

import path from 'path';
import Module from './phoneParser/phoneParser';

const localPhoneDataPath: string = path.resolve(
  __dirname,
  './phoneParser/phoneData.xml',
);

export * from './ITelephonyNetworkDelegate';
export * from './ITelephonyDBDelegate';
export * from './phoneParser/types';
export { Module, localPhoneDataPath };
