/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-01 16:49:01
 * Copyright © RingCentral. All rights reserved.
 */

import Module from './phoneParser/phoneParser';

const localPhoneDataPath: string = '/phoneData.xml';

export * from './ITelephonyNetworkDelegate';
export * from './ITelephonyDBDelegate';
export * from './phoneParser/types';
export { Module, localPhoneDataPath };
