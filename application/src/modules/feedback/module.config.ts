/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ModuleConfig } from 'framework/types';
import { FeedbackModule } from './FeedbackModule';
import { FeedbackService } from './service';

const config: ModuleConfig = {
  entry: FeedbackModule,
  provides: [FeedbackService],
};

export { config };
