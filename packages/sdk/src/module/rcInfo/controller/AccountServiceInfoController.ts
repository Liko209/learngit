/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-29 15:03:46
 * Copyright © RingCentral. All rights reserved.
 */
import { RCInfoFetchController } from './RCInfoFetchController';

const DEFAULT_MAX_EXTENSION_NUMBER_LENGTH = 5;
const DEFAULT_SHORT_EXTENSION_NUMBER_LENGTH = 0;

class AccountServiceInfoController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async getMaxExtensionNumberLength() {
    const serviceInfo = await this._getLimit();
    return (
      (serviceInfo && serviceInfo.maxExtensionNumberLength) ||
      DEFAULT_MAX_EXTENSION_NUMBER_LENGTH
    );
  }

  async getShortExtensionNumberLength() {
    const serviceInfo = await this._getLimit();
    return (
      (serviceInfo && serviceInfo.shortExtensionNumberLength) ||
      DEFAULT_SHORT_EXTENSION_NUMBER_LENGTH
    );
  }

  private async _getLimit() {
    const info = await this._rcInfoFetchController.getAccountServiceInfo();
    return info && info.limits;
  }
}

export { AccountServiceInfoController };
