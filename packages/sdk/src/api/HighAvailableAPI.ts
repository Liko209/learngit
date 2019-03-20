/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-13 13:14:31
 * Copyright © RingCentral. All rights reserved.
 */

import { RINGCENTRAL_API } from './ringcentral/constants';

/*
 * the list of highly available API requests can be found here:
 * http://platform-dev.dins.ru/artifacts/apimeta/web/apimeta.html
 */

const HighAvailableAPI = [
  RINGCENTRAL_API.API_OAUTH_TOKEN,
  RINGCENTRAL_API.API_Status,
  RINGCENTRAL_API.API_VERSION,
  RINGCENTRAL_API.API_CLIENT_INFO,
  RINGCENTRAL_API.API_ACCOUNT_INFO,
  RINGCENTRAL_API.API_EXTENSION_INFO,
  RINGCENTRAL_API.API_ROLE_PERMISSION,
  RINGCENTRAL_API.API_EXTENSION_PHONE_NUMBER,
  RINGCENTRAL_API.API_DIALING_PLAN,
  RINGCENTRAL_API.API_SPECIAL_SERVICE_NUMBER,
  RINGCENTRAL_API.API_PHONE_PARSER_DATA,
  RINGCENTRAL_API.API_PROFILE,
  RINGCENTRAL_API.API_GENERATE_CODE,
];

export { HighAvailableAPI };
