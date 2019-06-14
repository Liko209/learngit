/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-05 01:14:38
 * Copyright © RingCentral. All rights reserved.
 */

import { CALL_RESULT } from './constants';

type PseudoCallLogInfo = {
  [sessionId: string]: {
    id: string;
    result: CALL_RESULT;
  };
};

export { PseudoCallLogInfo };
