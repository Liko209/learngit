/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-07-01 13:30:56
 * Copyright © RingCentral. All rights reserved.
 */

import {
  SequenceProcessorHandler,
  SequenceProcessorOption,
} from './SequenceProcessorHandler';
import { IProcessor } from './IProcessor';

class AttachedSequenceProcessor implements IProcessor {
  constructor(
    public processor: IProcessor,
    public promise: (result: boolean) => void,
  ) {}
  async process(): Promise<boolean> {
    const result = await this.processor.process();
    this.promise(result);
    return result;
  }

  name(): string {
    return this.processor.name();
  }

  canContinue(): boolean {
    return true;
  }

  cancel() {
    if (this.processor.cancel) {
      this.processor.cancel();
    }

    this.promise(false);
  }
}

class AttachedSequenceProcessorHandler extends SequenceProcessorHandler {
  private _sequenceProcessor: SequenceProcessorHandler;
  constructor(
    sequenceProcessor: SequenceProcessorHandler,
    option: SequenceProcessorOption,
  ) {
    super(option);
    this._sequenceProcessor = sequenceProcessor;
  }

  async execute(): Promise<boolean> {
    const result = true;
    if (this._isExecuting) {
      return result;
    }

    const processor = this._processors.shift();
    if (processor) {
      this._isExecuting = true;
      const waiter = new Promise<boolean>(resolve => {
        const processor2 = new AttachedSequenceProcessor(processor, resolve);
        this._sequenceProcessor.addProcessor(processor2);
      });
      await waiter
        .then(() => {
          this._isExecuting = false;
          this.execute();
        })
        .catch(() => {
          this._isExecuting = false;
          this.execute();
        });
    }
    return result;
  }

  cancelAll() {
    this._processors.forEach((processor: IProcessor) => {
      if (processor) {
        this._sequenceProcessor.removeProcessorByName(processor.name());
      }
    });
    this.clear();
  }
}

export { AttachedSequenceProcessorHandler };
