/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:33:25
 * Copyright © RingCentral. All rights reserved.
 */

export enum RTC_NETWORK_EVENT {
  NETWORK_CHANGE = 'networkchange',
}

export enum RTC_NETWORK_STATE {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum RTC_REST_API {
  API_OAUTH_TOKEN = '/oauth/token',
  API_REFRESH_TOKEN = '/oauth/token',
  API_GENERATE_CODE = '/v1.0/interop/generate-code',
  API_EXTENSION_INFO = '/v1.0/account/~/extension/~',
  API_PROFILE = '/glip/profile',
  API_SIP_PROVISION = '/v1.0/client-info/sip-provision',
}

export type RTCMediaElement = {
  local: any;
  remote: any;
};
