/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-28 10:26:38
 * Copyright © RingCentral. All rights reserved.
 */

interface IRTCRegistrationFsmDependency {
  onProvisionReadyAction(provisionData: any, options: any): void;
  onReRegisterAction(forceToMain: boolean): void;
  onNetworkChangeToOnlineAction(): void;
  onUnregisterAction(): void;
  onReceiveIncomingInviteAction(session: any): void;
  onSwitchBackProxyAction(): void;
}

export { IRTCRegistrationFsmDependency };
