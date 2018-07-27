import SDK from 'ringcentral';
import { appkey, appSecret, appName } from './constant';

const redirectPath = 'glip://rclogin';
const redirectUri = window.location.origin + redirectPath;

const sdk = new SDK({
  server: 'https://platform.ringcentral.com',
  appKey: appkey,
  appSecret,
  redirectUri,
  appName,
  appVersion: '1.0.0',
});
export const platform = sdk.platform();
