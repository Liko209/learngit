/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 19:47:44
 * Copyright © RingCentral. All rights reserved.
 */

import { FeedbackModule } from './FeedbackModule';
import { FeedbackService } from './service';

const config = {
  entry: FeedbackModule,
  provides: { FeedbackService },
};

export { config };
