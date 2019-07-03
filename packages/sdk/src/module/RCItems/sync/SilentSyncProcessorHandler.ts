/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-14 10:40:09
 * Copyright © RingCentral. All rights reserved.
 */

import { SingletonSequenceProcessor } from 'sdk/framework/processor';

const silentSyncProcessorHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
  { name: 'silentSyncProcessorHandler' },
);

export { silentSyncProcessorHandler };
