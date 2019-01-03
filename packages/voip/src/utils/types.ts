/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:33:25
 * Copyright © RingCentral. All rights reserved.
 */

type RTCSipProvisionInfo = {
  sipFlags: object;
  device: {
    transport: string;
    password: string;
    domain: string;
    username: string;
    authorizationID: string;
    outboundProxy: string;
  }[];
  sipInfo: object;
};

enum RTCPROV_EVENT {
  NEWPROV = 'newProv',
}

export { RTCSipProvisionInfo, RTCPROV_EVENT };
