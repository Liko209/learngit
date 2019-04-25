/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 10:31:39
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from './IProcessor';

abstract class AbstractProcessor {
  private _name: string;
  protected _processors: IProcessor[] = [];
  private _addProcessorStrategy?: (
    totalProcessors: IProcessor[],
    newProcessors: IProcessor,
    existed: boolean,
  ) => IProcessor[];
  constructor(
    name: string,
    addProcessorStrategy?: (
      totalProcessors: IProcessor[],
      newProcessors: IProcessor,
      existed: boolean,
    ) => IProcessor[],
  ) {
    this._name = name;
    this._addProcessorStrategy = addProcessorStrategy;
  }

  abstract async execute(): Promise<boolean>;
  abstract cancelAll(): void;

  name(): string {
    return this._name;
  }

  getProcessors(): IProcessor[] {
    return this._processors;
  }

  addProcessor(processor: IProcessor): boolean {
    let existed = false;

    this._processors.forEach((item: IProcessor) => {
      if (item.name() === processor.name()) {
        existed = true;
      }
    });

    if (this._addProcessorStrategy) {
      this._processors = this._addProcessorStrategy(
        this._processors,
        processor,
        existed,
      );
    } else {
      if (!existed) {
        this._processors.push(processor);
      }
    }

    return true;
  }

  removeProcessor(processor: IProcessor): boolean {
    const name = processor.name();
    return this.removeProcessorByName(name);
  }

  removeProcessorByName(name: string): boolean {
    let existed = false;
    this._processors = this._processors.filter((item: IProcessor) => {
      if (item.name() === name) {
        existed = true;
        return false;
      }
      return true;
    });
    return existed;
  }

  clear() {
    this._processors = [];
  }
}

export { AbstractProcessor };
