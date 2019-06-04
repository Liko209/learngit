/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-09 14:53:49
 * Copyright © RingCentral. All rights reserved.
 */

const API_VERSION = 'v1.0';

const RINGCENTRAL_API = {
  API_OAUTH_TOKEN: '/oauth/token',
  API_REFRESH_TOKEN: '/oauth/token',
  API_Status: `/${API_VERSION}/status`,
  API_VERSION: '',
  API_CLIENT_INFO: `/${API_VERSION}/client-info`,

  API_ACCOUNT_INFO: `/${API_VERSION}/account/~`,
  API_EXTENSION_INFO: `/${API_VERSION}/account/~/extension/~`,
  API_ROLE_PERMISSIONS: `/${API_VERSION}/account/~/extension/~/authz-profile`,
  API_EXTENSION_PHONE_NUMBER: `/${API_VERSION}/account/~/extension/~/phone-number`,
  API_SERVICE_INFO: `/${API_VERSION}/account/~/service-info`,
  API_DIALING_PLAN: `/${API_VERSION}/account/~/dialing-plan`,
  API_FORWARDING_NUMBERS: `/${API_VERSION}/account/~/extension/~/forwarding-number`,

  API_SPECIAL_SERVICE_NUMBER: `/${API_VERSION}/client-info/special-number-rule`,
  API_PHONE_PARSER_DATA: `/${API_VERSION}/number-parser/phonedata.xml`,
  API_PROFILE: '/glip/profile',
  API_GENERATE_CODE: `/${API_VERSION}/interop/generate-code`,
};

const RC_ITEM_API = {
  CALL_LOG: `/${API_VERSION}/account/~/extension/~/call-log`,
  CALL_LOG_SYNC: `/${API_VERSION}/account/~/extension/~/call-log-sync`,
  MESSAGE_STORE: `/${API_VERSION}/account/~/extension/~/message-store`,
  MESSAGE_SYNC: `/${API_VERSION}/account/~/extension/~/message-sync`,
};

const HTTP_HEADER_KEY = {
  ACCEPT: 'Accept',
  IF_NONE_MATCH: 'If-None-Match',
  CONTENT_TYPE: 'Content-Type',
};

const CONTENT_TYPE = {
  XML: 'application/xml',
  JSON: 'application/json',
};

export { RINGCENTRAL_API, HTTP_HEADER_KEY, CONTENT_TYPE, RC_ITEM_API };
