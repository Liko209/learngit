/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 17:42:10
 */
import * as LogRocket from 'logrocket';
import { envConfig } from './globalConfig';

import { Sdk, LogControlManager } from 'sdk';

// send configs to sdk
export async function initAll() {
  LogControlManager.instance().setDebugMode(
    process.env.NODE_ENV === 'development',
  );

  LogRocket.init('b8htiw/fiji-app');
  await Sdk.init({
    api: envConfig.api,
    db: envConfig.db,
  });
}
