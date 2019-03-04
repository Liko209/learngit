/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 12:20:43
 * Copyright © RingCentral. All rights reserved.
 */

import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { ThumbnailPreloadProcessor } from './ThumbnailPreloadProcessor';

class ThumbnailPreloadController {
  private _sequenceProcessorHandler: SequenceProcessorHandler = new SequenceProcessorHandler(
    'Thumbnail Sequence Processor',
  );

  handleFileItems(ids: number[]) {
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
