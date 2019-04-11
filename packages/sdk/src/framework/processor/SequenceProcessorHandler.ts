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

const MAX_QUEUE = 10000;

class SequenceProcessorHandler extends AbstractProcessor {
  private _isExecuting: boolean = false;
  private _maxQueue: number;
  private LOG_TAG = 'SequenceProcessorHandler';

  constructor(name: string, maxQueue: number = MAX_QUEUE) {
    super(name);
    this._maxQueue = maxQueue;
    this._subscribeNotifications();
  }

  addProcessor(processor: IProcessor): boolean {
    if (this._processors.length >= this._maxQueue) {
      mainLogger.log(
        `${this.LOG_TAG}-${this.name} over threshold:${
          this._maxQueue
        }, remove the oldest one`,
      );
      this._processors.shift();
    }

    const result = super.addProcessor(processor);

    !result &&
      mainLogger.log(`${this.LOG_TAG}-${this.name}, add process failed`);

    this.execute();
    return result;
  }

  addProcessors(processors: IProcessor[]): IProcessor[] {
    const addedProcessors: IProcessor[] = [];
    processors.forEach((processor: IProcessor) => {
      if (this.addProcessor(processor)) {
        addedProcessors.push(processor);
      }
    });
    return addedProcessors;
  }

  replaceProcessors(processors: IProcessor[]): IProcessor[] {
    this.clear();
    return this.addProcessors(processors);
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
}

export { SequenceProcessorHandler };
