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

  constructor(
    name: string,
    addProcessorStrategy?: (
      totalProcessors: IProcessor[],
      newProcessors: IProcessor,
      existed: boolean,
    ) => IProcessor[],
    private _maxSize?: number,
  ) {
    super(name, addProcessorStrategy);
  }

  addProcessor(processor: IProcessor): boolean {
    const result = this._addProcessor(processor);
    this.execute();
    return result;
  }

  addProcessors(processors: IProcessor[]): IProcessor[] {
    const addedProcessors: IProcessor[] = [];
    processors.forEach((processor: IProcessor) => {
      if (this._addProcessor(processor)) {
        addedProcessors.push(processor);
      }
    });
    this.execute();
    return addedProcessors;
  }

  private _addProcessor(processor: IProcessor) {
    if (this._maxSize && this._processors.length === this._maxSize - 1) {
      const lastProcessor = this._processors.pop();
      if (lastProcessor && lastProcessor.cancel) {
        lastProcessor.cancel();
      }
    }

    return super.addProcessor(processor);
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

  cancelAll() {
    this._processors.forEach((processor: IProcessor) => {
      if (processor && processor.cancel) {
        processor.cancel();
      }
    });
    this.clear();
  }
}

export { SequenceProcessorHandler };
