/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 13:25:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractProcessor } from './AbstractProcessor';
import { IProcessor } from './IProcessor';
import { mainLogger } from 'foundation';

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

    const processor = this._processors.shift();
    if (processor) {
      this._isExecuting = true;

      await processor
        .process()
        .then(() => {
          this._isExecuting = false;
          this.execute();
          mainLogger.info('SequenceProcessorHandler do fetch');
        })
        .catch((error: Error) => {
          mainLogger.info(
            `SequenceProcessorHandler (${this.name}): ${JSON.stringify(
              error,
            )}: `,
          );
          this._isExecuting = false;
          this.execute();
        });
    } else {
      mainLogger.info(`SequenceProcessorHandler (${this.name()}): is done`);
    }

    return result;
  }
}

export default SequenceProcessorHandler;
