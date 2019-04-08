/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-04-02 15:08:44
 * Copyright © RingCentral. All rights reserved.
 */

import { UserConfig } from '../../config';
import { AccountGlobalConfig } from '../../../service/account/config';

class CommonUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'config');
  }
}

export { CommonUserConfig };
