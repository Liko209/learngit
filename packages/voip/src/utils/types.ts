/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:33:25
 * Copyright © RingCentral. All rights reserved.
 */

enum RTC_NETWORK_EVENT {
  NETWORK_CHANGE = 'networkchange',
}

enum RTC_NETWORK_STATE {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export { RTC_NETWORK_EVENT, RTC_NETWORK_STATE };
