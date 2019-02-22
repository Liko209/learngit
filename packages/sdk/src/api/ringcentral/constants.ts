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
  API_EXTENSION_INFO: `/${API_VERSION}/account/~/extension/~`,
  API_PROFILE: '/glip/profile',
  API_SPECIAL_SERVICE_NUMBER: `/${API_VERSION}/client-info/special-number-rule`,
  API_PHONE_PARSER_DATA: `/${API_VERSION}/number-parser/phonedata.xml`,
  API_DIALING_PLAN: `/${API_VERSION}/account/~/dialing-plan`,
  API_EXTENSION_PHONE_NUMBER: `/${API_VERSION}/account/~/extension/~/phone-number`,
};

const HTTP_HEADER_KEY = {
  ACCEPT: 'Accept',
  IF_NONE_MATCH: 'If-None-Match',
};

const CONTENT_TYPE = {
  XML: 'application/xml',
};

export { RINGCENTRAL_API, HTTP_HEADER_KEY, CONTENT_TYPE };
