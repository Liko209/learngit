/*
 * @Author: Lewi.Li
 * @Date: 2019-05-07 20:01:37
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed } from 'mobx';
import BaseNotificationSubscribable from '../base/BaseNotificationSubscribable';
import { SERVICE } from 'sdk/service/eventKey';
import { RegionInfo } from 'sdk/module/rcInfo';

class DialingCountryHandler extends BaseNotificationSubscribable {
  @observable
  private _regionInfo: RegionInfo;

  constructor() {
    super();
    this.subscribeNotification(
      SERVICE.RC_INFO_SERVICE.REGION_UPDATED,
      regionInfo => {
        this._regionInfo = regionInfo;
      },
    );
  }

  @computed
  get regionInfo() {
    return this._regionInfo;
  }
}

const dialingCountryHandler = new DialingCountryHandler();

export { dialingCountryHandler };
