/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-04 17:29:06
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { IProcessor } from 'sdk/framework/processor';

class SubscriptionProcessor implements IProcessor {
  constructor(
    private _name: string,
    private _processFunc: () => Promise<void>,
  ) {}

  async process(): Promise<boolean> {
    try {
      await this._processFunc();
    } catch (e) {
      mainLogger.warn('failed to execute rc subscription', e);
    }
    return Promise.resolve(true);
  }

  canContinue(): boolean {
    return true;
  }

  name(): string {
    return this._name;
  }
}

export { SubscriptionProcessor };
