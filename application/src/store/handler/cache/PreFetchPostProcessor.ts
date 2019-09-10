/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-01 16:44:04
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from 'sdk/framework/processor/IProcessor';
import { mainLogger } from 'foundation/log';

export default class PreFetchPostProcessor implements IProcessor {
  constructor(
    private _groupId: number,
    private _processFunc: (groupId: number) => Promise<void>,
    private _name?: string,
  ) {}

  async process(): Promise<boolean> {
    try {
      await this._processFunc(this._groupId);
    } catch (e) {
      mainLogger.warn(`failed to preFetch post of group ${this.name()}`, e);
    }
    return Promise.resolve(true);
  }

  canContinue(): boolean {
    return true;
  }

  name(): string {
    return this._name || `${this._groupId}`;
  }
}
