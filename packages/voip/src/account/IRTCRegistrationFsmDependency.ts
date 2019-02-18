/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:26:38
 * Copyright © RingCentral. All rights reserved.
 */

import { IRTCCallDelegate } from '../api/IRTCCallDelegate';
import { RTCCallOptions } from '../api/types';

interface IRTCRegistrationFsmDependency {
  onRegistrationAction(): void;
  onProvisionReadyAction(provisionData: any, options: any): void;
  onReRegisterAction(): void;
  onNetworkChangeToOnlineAction(): void;
  onUnregisterAction(): void;
  onMakeOutgoingCallAction(
    toNumber: string,
    delegate: IRTCCallDelegate,
    options: RTCCallOptions,
  ): void;
  onReceiveIncomingInviteAction(session: any): void;
}

export { IRTCRegistrationFsmDependency };
