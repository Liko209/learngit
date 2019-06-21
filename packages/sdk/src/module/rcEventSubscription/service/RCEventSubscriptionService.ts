/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-22 16:11:20
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractService } from 'sdk/framework/service/AbstractService';
import { RCSubscriptionController } from '../controller';
import { RCEventSubscriptionConfig } from '../config';

class RCEventSubscriptionService extends AbstractService {
  private _subscriptionController: RCSubscriptionController;
  private _userConfig: RCEventSubscriptionConfig;
  constructor() {
    super();
  }

  protected onStarted() {
    this._getSubscriptionController().startSubscription();
  }

  protected onStopped() {}

  private _getSubscriptionController() {
    if (!this._subscriptionController) {
      this._subscriptionController = new RCSubscriptionController(
        this.userConfig,
      );
    }
    return this._subscriptionController;
  }

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new RCEventSubscriptionConfig();
    }
    return this._userConfig;
  }
}

export { RCEventSubscriptionService };
