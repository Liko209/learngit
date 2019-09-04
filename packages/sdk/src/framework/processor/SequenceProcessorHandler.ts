/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 13:25:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractProcessor } from './AbstractProcessor';
import { IProcessor } from './IProcessor';
import { mainLogger } from 'foundation/log';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';

type SequenceProcessorOption = {
  name: string;
  addProcessorStrategy?: (
    totalProcessors: IProcessor[],
    newProcessor: IProcessor,
    existed: boolean,
  ) => IProcessor[];
  maxSize?: number;
  onExceedMaxSize?: (totalProcessors: IProcessor[]) => void;
};

class SequenceProcessorHandler extends AbstractProcessor {
  protected _isExecuting: boolean = false;
  constructor(public option: SequenceProcessorOption) {
    super(option.name, option.addProcessorStrategy);
    this._subscribeNotifications();
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
    if (
      this.option.maxSize &&
      this._processors.length === this.option.maxSize &&
      this.option.onExceedMaxSize
    ) {
      this.option.onExceedMaxSize(this._processors);
    }

    return super.addProcessor(processor);
  }

  protected async process(processor: IProcessor) {
    return processor.process();
  }

  async execute(): Promise<boolean> {
    let result = true;
    if (this._isExecuting) {
      return result;
    }

    const processor = this._processors.shift();
    if (processor) {
      this._isExecuting = true;
      result = await this.process(processor)
        .then(() => {
          return this.onProcessDone(true);
        })
        .catch((error: Error) => {
          mainLogger.info(
            `SequenceProcessorHandler (${this.name}): ${JSON.stringify(
              error,
            )}: `,
          );
          return this.onProcessDone(false);
        });
    } else {
      mainLogger.info(`SequenceProcessorHandler (${this.name()}): is done`);
    }

    return result;
  }

  protected onProcessDone(result: boolean) {
    this._isExecuting = false;
    this.execute();
    return result;
  }

  private _subscribeNotifications() {
    notificationCenter.on(
      SERVICE.WAKE_UP_FROM_SLEEP,
      this._onWakeUpFromSleep.bind(this),
    );
  }
  private _onWakeUpFromSleep() {
    // try to execute next one when wake up from sleep
    if (this._isExecuting) {
      this._isExecuting = false;
      this.execute();
    }
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

export { SequenceProcessorHandler, SequenceProcessorOption };