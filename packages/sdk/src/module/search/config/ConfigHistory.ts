/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-20 10:09:21
 * Copyright © RingCentral. All rights reserved.
 */

import { CONFIG_TYPE } from 'sdk/module/config/constants';

import { ConfigChangeHistory } from 'sdk/framework/config/types';
import { SEARCH_MODULE_NAME, SEARCH_CONFIG_KEYS } from './constants';

const searchConfigVersion: ConfigChangeHistory = {
  version: 1,
  moduleName: SEARCH_MODULE_NAME,
  changes: {
    1: [
      {
        move: {
          from: {
            type: CONFIG_TYPE.USER,
            value: SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS,
          },
          to: {
            type: CONFIG_TYPE.DB,
            value: SEARCH_CONFIG_KEYS.RECENT_SEARCH_RECORDS,
          },
        },
      },
    ],
  },
};

export { searchConfigVersion };
