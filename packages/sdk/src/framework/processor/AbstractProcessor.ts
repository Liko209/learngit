/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-03 10:31:39
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from './IProcessor';

abstract class AbstractProcessor {
  private _name: string;
  protected _processors: IProcessor[] = [];

  constructor(name: string) {
    this._name = name;
  }

  abstract async execute(): Promise<boolean>;

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
    if (!existed) {
      this._processors.push(processor);
      return true;
    }
    return false;
  }

  removeProcessor(processor: IProcessor): boolean {
    let existed = false;
    this._processors = this._processors.filter((item: IProcessor) => {
      if (item.name() === processor.name()) {
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
