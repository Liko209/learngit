/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-08-14 09:39:27
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Caller } from '../types';
import { UndefinedAble } from 'sdk/types';

class RCItemUtils {
  static toCallerView(caller: UndefinedAble<Caller>) {
    return (
      caller && { ..._.pick(caller, 'name', 'phoneNumber', 'extensionNumber') }
    );
  }
}

export { RCItemUtils };
