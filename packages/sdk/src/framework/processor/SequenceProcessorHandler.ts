/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 13:25:47
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractProcessor } from './AbstractProcessor';
import { IProcessor } from './IProcessor';
import { mainLogger } from 'foundation';
import notificationCenter from '../../service/notificationCenter';
import { SERVICE } from '../../service/eventKey';

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
    private _onExceedMaxSize?: (totalProcessors: IProcessor[]) => void,
  ) {
    super(name, addProcessorStrategy);

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
      this._maxSize &&
      this._onExceedMaxSize &&
      this._processors.length === this._maxSize
    ) {
      this._onExceedMaxSize(this._processors);
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

export { SequenceProcessorHandler };
