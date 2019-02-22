/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 14:53:49
 * Copyright © RingCentral. All rights reserved.
 */

const API_VERSION = 'v1.0';

const RINGCENTRAL_API = {
  API_OAUTH_TOKEN: '/oauth/token',
  API_REFRESH_TOKEN: '/oauth/token',
  API_GENERATE_CODE: `/${API_VERSION}/interop/generate-code`,
  API_PROFILE: '/glip/profile',
  API_CLIENT_INFO: `/${API_VERSION}/client-info`,
  API_ACCOUNT_INFO: `/${API_VERSION}/account/~`,
  API_EXTENSION_INFO: `/${API_VERSION}/account/~/extension/~`,
  API_ROLE_PERMISSION: `/${API_VERSION}/account/~/extension/~/authz-profile`,
};
export { RINGCENTRAL_API };
