/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:27:24
 * Copyright © RingCentral. All rights reserved.
 */
import UserPermissionType from '../../types';
import { SplitFactory } from '@splitsoftware/splitio';

type SplitIOClientParams = {
  authKey: string;
  userId: string;
  attributes: Object;
  permissions: string[];
  splitIOReady: (isReady: boolean) => void;
  splitIOUpdate: () => void;
};

const TRAFFIC_TYPE_USER = 'user';

class SplitIOClient {
  public trafficType: string;
  public client: SplitIO.IClient;
  private splitUpdateCallback: any;
  private splitReadyCallback: any;
  private featureName: string[];
  constructor(params: SplitIOClientParams) {
    this.trafficType = TRAFFIC_TYPE_USER;
    this.splitUpdateCallback = params.splitIOUpdate;
    this.splitReadyCallback = params.splitIOReady;
    this.featureName = params.permissions;

    const settings: SplitIO.IBrowserSettings = {
      core: {
        authorizationKey: params.authKey,
        trafficType: this.trafficType,
        key: params.userId,
      },
    };
    this.client = SplitFactory(settings).client();
    this._subscribeSplitEvents();
  }

  private _subscribeSplitEvents() {
    this.client.on(this.client.Event.SDK_READY, () => {
      this.splitReadyCallback && this.splitReadyCallback();
    });
    this.client.on(this.client.Event.SDK_UPDATE, () => {
      this.splitUpdateCallback && this.splitUpdateCallback();
    });
  }

  async getAllPermissions() {
    return this.client.getTreatments(this.featureName);
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    const result = await this.client.getTreatments(this.featureName);
    return result[type] === 'on';
  }
}

export { SplitIOClient };
