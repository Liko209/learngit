/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-06-28 10:03:14
 * Copyright © RingCentral. All rights reserved.
 */

import {
  SequenceProcessorHandler,
  SequenceProcessorOption,
} from './SequenceProcessorHandler';
import { AttachedSequenceProcessorHandler } from './AttachedSequenceProcessorHandler';

class SingletonSequenceProcessor {
  static processorHandler: SequenceProcessorHandler;
  private static get _instance() {
    if (!this.processorHandler) {
      this.processorHandler = new SequenceProcessorHandler({
        name: 'SingleSequenceProcessor',
      });
    }
    return this.processorHandler;
  }

  static getSequenceProcessorHandler(option: SequenceProcessorOption) {
    return new AttachedSequenceProcessorHandler(
      SingletonSequenceProcessor._instance,
      option,
    );
  }
}

export { SingletonSequenceProcessor };
