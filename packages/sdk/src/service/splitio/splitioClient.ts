/*
 * @Author: steven.zhuang
 * @Date: 2018-11-13 15:14:22
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation';
import { SplitFactory } from '@splitsoftware/splitio';

const LOG_TAG = '[SplitIO]';
const TRAFFIC_TYPE_USER = 'user';

type UpdateHandler = (
  identity: string,
  featureName: string,
  status: string,
) => void;

class SplitIOClient {
  public trafficType: string;
  public client: SplitIO.IClient;

  constructor(
    public authKey: string,
    public identity: string,
    public attributes: SplitIO.Attributes,
    public splitNames: string[],
    public updateHandler: UpdateHandler,
  ) {
    this.trafficType = TRAFFIC_TYPE_USER;
    this._createClient();
  }

  public shutdown() {
    this.client && this.client.destroy();
  }

  public factorySplitClient(settings: SplitIO.IBrowserSettings) {
    return SplitFactory(settings).client();
  }

  private _createClient() {
    const settings: SplitIO.IBrowserSettings = {
      core: {
        authorizationKey: this.authKey,
        trafficType: this.trafficType,
        key: this.identity,
      },
      storage: {
        type: 'MEMORY', // 'LOCALSTORAGE',
      },
      debug: false,
    };

    this.client = this.factorySplitClient(settings);
    this.client.on(this.client.Event.SDK_READY, () => {
      mainLogger.info(
        `${LOG_TAG} SDK_READY. ${this.trafficType}:${this.identity}`,
      );
      this._syncTreatments();
    });
    this.client.on(this.client.Event.SDK_UPDATE, () => {
      mainLogger.info(
        `${LOG_TAG} SDK_UPDATE. ${this.trafficType}:${this.identity}`,
      );
      this._syncTreatments();
    });

    mainLogger.info(
      `${LOG_TAG} Created client for ${this.trafficType}:${
        this.identity
      }, ${JSON.stringify(this.attributes)}`,
    );
  }

  private _syncTreatments() {
    const treatments: SplitIO.Treatments = this.client.getTreatments(
      this.splitNames,
      this.attributes,
    );
    mainLogger.info(
      `${LOG_TAG} Treatments for ${this.trafficType}:${
        this.identity
      }: ${JSON.stringify(treatments)}`,
    );

    if (treatments && this.updateHandler) {
      Object.keys(treatments).forEach((splitName: string) => {
        this.updateHandler(this.identity, splitName, treatments[splitName]);
      });
    }
  }
}

export { SplitIOClient };
