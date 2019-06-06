/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-14 10:40:09
 * Copyright © RingCentral. All rights reserved.
 */

import { SequenceProcessorHandler } from 'sdk/framework/processor/SequenceProcessorHandler';

const silentSyncProcessorHandler = new SequenceProcessorHandler(
  'silentSyncProcessorHandler',
);

export { silentSyncProcessorHandler };
