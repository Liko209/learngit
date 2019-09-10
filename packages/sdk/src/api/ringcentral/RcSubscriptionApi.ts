/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-22 16:13:01
 * Copyright © RingCentral. All rights reserved.
 */

import {
  NETWORK_METHOD,
  NETWORK_VIA,
  CONTENT_TYPES,
  REQUEST_HEADER_KEYS,
} from 'foundation/network';

import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import {
  RcSubscriptionParams,
  RcSubscriptionInfo,
} from './types/RCEventSubscription';

const RC_SUBSCRIPTION_HEADERS = {
  [REQUEST_HEADER_KEYS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
};

class RcSubscriptionApi extends Api {
  static createSubscription(params: RcSubscriptionParams) {
    const query = {
      headers: RC_SUBSCRIPTION_HEADERS,
      data: params,
      path: RINGCENTRAL_API.API_SUBSCRIPTION,
      method: NETWORK_METHOD.POST,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    };
    return RcSubscriptionApi.rcNetworkClient.http<RcSubscriptionInfo>(query);
  }

  static renewSubscription(subscriptionId: string) {
    return RcSubscriptionApi.rcNetworkClient.http<RcSubscriptionInfo>({
      path: `${RINGCENTRAL_API.API_SUBSCRIPTION}/${subscriptionId}/renew`,
      method: NETWORK_METHOD.POST,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    });
  }

  static updateSubscription(
    subscriptionId: string,
    params: RcSubscriptionParams,
  ) {
    return RcSubscriptionApi.rcNetworkClient.http<RcSubscriptionInfo>({
      headers: RC_SUBSCRIPTION_HEADERS,
      path: `${RINGCENTRAL_API.API_SUBSCRIPTION}/${subscriptionId}`,
      method: NETWORK_METHOD.PUT,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      data: params,
    });
  }

  static cancelSubscription(subscriptionId: string) {
    return RcSubscriptionApi.rcNetworkClient.http({
      path: `${RINGCENTRAL_API.API_SUBSCRIPTION}/${subscriptionId}`,
      method: NETWORK_METHOD.DELETE,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    });
  }

  static getSubscription(subscriptionId: string) {
    return RcSubscriptionApi.rcNetworkClient.http<RcSubscriptionInfo>({
      path: `${RINGCENTRAL_API.API_SUBSCRIPTION}/${subscriptionId}`,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
    });
  }
}

export { RcSubscriptionApi };
