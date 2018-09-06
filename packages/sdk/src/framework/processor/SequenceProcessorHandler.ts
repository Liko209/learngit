/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 13:25:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractProcessor } from './AbstractProcessor';
class SequenceProcessorHandler extends AbstractProcessor {
  constructor(name: string) {
    super(name);
  }

  async process(): Promise<boolean> {
    let totalSuccess = true;
    for (let i = 0; i < this._processors.length; i += 1) {
      const oneSuccess = await this._processors[i].process();
      totalSuccess = totalSuccess && oneSuccess;
      if (!this._processors[i].canContinue()) {
        break;
      }
    }
    return totalSuccess;
  }
}

export default SequenceProcessorHandler;
