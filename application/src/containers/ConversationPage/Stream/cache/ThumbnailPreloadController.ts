/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 12:20:43
 * Copyright © RingCentral. All rights reserved.
 */

import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { ThumbnailPreloadProcessor } from './ThumbnailPreloadProcessor';
import notificationCenter from 'sdk/service/notificationCenter';
import { SERVICE } from 'sdk/service/eventKey';

class ThumbnailPreloadController {
  private _sequenceProcessorHandler: SequenceProcessorHandler = new SequenceProcessorHandler(
    'Thumbnail Sequence Processor',
  );

  constructor() {
    notificationCenter.on(SERVICE.LOGOUT, () => {
      this.clear();
    });
  }

  clear() {
    this._sequenceProcessorHandler.clear();
  }

  preload(ids: number[]) {
    ids.forEach((id: number) => {
      this._sequenceProcessorHandler.addProcessor(
        new ThumbnailPreloadProcessor(this._sequenceProcessorHandler, {
          id,
          count: ids.length,
        }),
      );
    });
  }
}

export { ThumbnailPreloadController };
