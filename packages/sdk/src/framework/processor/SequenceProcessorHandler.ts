/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 13:25:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractProcessor } from './AbstractProcessor';
import { IProcessor } from './IProcessor';
class SequenceProcessorHandler extends AbstractProcessor {
  private _isExecuting: boolean = false;

  constructor(name: string) {
    super(name);
  }

  addProcessor(processor: IProcessor): boolean {
    const result = super.addProcessor(processor);
    this.execute();
    return result;
  }

  async execute(): Promise<boolean> {
    const result = true;
    if (this._isExecuting) {
      return result;
    }

    const processor = this._processors.pop();
    if (processor) {
      this._isExecuting = true;
      await processor.process().then(() => {
        this._isExecuting = false;
        this.execute();
      });
    } else {
      console.log(`${this.name()}: is done`);
    }

    return result;
  }
}

export default SequenceProcessorHandler;
