/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-29 13:36:21
 * Copyright © RingCentral. All rights reserved.
 */

import { TelephonyDataCollectionInfoConfigType } from '../types';
import { getCurrentTime } from 'sdk/utils/jsUtils';
import _ from 'lodash';
import { mainLogger } from 'foundation/log';
import { traceData } from 'sdk/api/glip/dataCollection';

import { RTCNoAudioStateEvent, RTCNoAudioDataEvent } from 'voip';

class TelephonyDataCollectionController {
  private _config: TelephonyDataCollectionInfoConfigType;
  constructor() {}

  setDataCollectionInfoConfig(info: TelephonyDataCollectionInfoConfigType) {
    this._config = info;
  }

  isProduction() {
    return this._config && this._config.isProduction;
  }

  traceNoAudioData(noAudioDataEvent: RTCNoAudioDataEvent): void {
    this._addMorePropertiesAndTrace(noAudioDataEvent);
  }

  traceNoAudioStatus(noAudioStateEvent: RTCNoAudioStateEvent): void {
    this._addMorePropertiesAndTrace(noAudioStateEvent);
  }

  private _addMorePropertiesAndTrace(original: { event: object }) {
    try {
      const model: any = _.cloneDeep(original);
      Object.assign(model.event, {
        timestamp: getCurrentTime(),
      });
      Object.assign(model.event.details, {
        build_type: this.isProduction() ? 'prod' : 'non_prod',
      });
      Object.assign(model.event.details, this._getUserInfo());

      this._collectData(model);
    } catch (e) {
      mainLogger.log('trace data error', e);
    }
  }

  private _getUserInfo() {
    return {
      user_id:
        (this._config &&
          this._config.userInfo &&
          this._config.userInfo.userId) ||
        '',
      company_id:
        (this._config &&
          this._config.userInfo &&
          this._config.userInfo.companyId) ||
        '',
    };
  }

  private async _collectData(model: object) {
    try {
      traceData(model);
    } catch (error) {
      mainLogger.log('trace telephony data error', error);
    }
  }
}

export { TelephonyDataCollectionController };
