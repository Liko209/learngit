/*
 * @Author: Paynter Chen
 * @Date: 2019-07-08 10:42:54
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDebugModule } from '../BaseDebugModule';

class DebugLogModule extends BaseDebugModule {}
const debugLog = new DebugLogModule();
export { debugLog };
