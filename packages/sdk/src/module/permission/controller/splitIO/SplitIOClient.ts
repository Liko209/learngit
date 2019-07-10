/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:27:24
 * Copyright © RingCentral. All rights reserved.
 */
import UserPermissionType from '../../types';
import { SplitFactory } from '@splitsoftware/splitio';
import { mainLogger } from 'foundation';

type SplitIOClientParams = {
  authKey: string;
  userId: string;
  attributes: Object;
  permissions: string[];
  splitIOReady: () => void;
  splitIOUpdate: () => void;
};

const TRAFFIC_TYPE_USER = 'user';

class SplitIOClient {
  public trafficType: string;
  public client: SplitIO.IClient;
  private splitUpdateCallback: any;
  private splitReadyCallback: any;
  private featureName: string[];
  private attributes: any;
  constructor(params: SplitIOClientParams) {
    this.trafficType = TRAFFIC_TYPE_USER;
    this.splitUpdateCallback = params.splitIOUpdate;
    this.splitReadyCallback = params.splitIOReady;
    this.featureName = params.permissions;
    this.attributes = params.attributes || {};

    const settings: SplitIO.IBrowserSettings = {
      core: {
        authorizationKey: params.authKey,
        trafficType: this.trafficType,
        key: params.userId,
      },
      startup: {
        requestTimeoutBeforeReady: 5, // 5 seconds
        readyTimeout: 5, // 5 seconds
        retriesOnFailureBeforeReady: 2, // 2 retries
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
    this.client.on(this.client.Event.SDK_READY_TIMED_OUT, (e: any) => {
      mainLogger.info('SplitIO SDK_READY_TIMED_OUT', e);
    });
  }

  async getAllPermissions() {
    return await this.client.getTreatments(this.featureName, this.attributes);
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    const result = await this.client.getTreatments([type], this.attributes);
    return result[type] === 'on';
  }

  shutdown() {
    this.client.destroy();
  }
}

export { SplitIOClient };
