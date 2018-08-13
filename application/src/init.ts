/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 17:42:10
 */
import config from './config';

import { Sdk, LogControlManager } from 'sdk';

const api = config.get('api');
const db = config.get('db');
// send configs to sdk
export async function initAll() {
  LogControlManager.instance().setDebugMode(
    process.env.NODE_ENV === 'development',
  );

  await Sdk.init({
    api,
    db,
  });
}
