/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-15 16:12:39
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from 'sdk/framework/processor/IProcessor';
import { mainLogger } from 'foundation/log';

class SilentSyncProcessor implements IProcessor {
  constructor(
    private _syncName: string,
    private _processFunc: () => Promise<void>,
  ) {}

  async process(): Promise<boolean> {
    mainLogger.tags(this._syncName).info('silent sync start');
    await this._processFunc();
    mainLogger.tags(this._syncName).info('silent sync end');
    return true;
  }

  name(): string {
    return `${this._syncName}`;
  }
}

export { SilentSyncProcessor };
