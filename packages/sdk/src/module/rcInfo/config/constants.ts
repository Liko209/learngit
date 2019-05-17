/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-08 10:57:43
 * Copyright © RingCentral. All rights reserved.
 */

import { ConfigChangeHistory } from '../../../framework/config/types';
import { CONFIG_TYPE } from '../../config/constants';

const MODULE_NAME = 'rcInfo';

const RC_INFO_KEYS = {
  ACCOUNT_INFO: 'account_info',
  CLIENT_INFO: 'client_info',
  EXTENSION_INFO: 'extension_info',
  ROLE_PERMISSIONS: 'role_permissions',
  SPECIAL_NUMBER_RULE: 'special_number_rule',
  PHONE_DATA: 'PHONE_DATA',
  PHONE_DATA_VERSION: 'PHONE_DATA_VERSION',
  EXTENSION_PHONE_NUMBER_LIST: 'extension_phone_number_list',
  DIALING_PLAN: 'dialing_plan',
  ACCOUNT_SERVICE_INFO: 'account_service_info',
};

const RC_INFO_GLOBAL_KEYS = {
  STATION_LOCATION: 'station_location',
};

const RC_INFO_HISTORY: ConfigChangeHistory = {
  version: 1,
  moduleName: MODULE_NAME,
  changes: {
    1: {
      delete: [
        { type: CONFIG_TYPE.USER, value: 'account_info' },
        { type: CONFIG_TYPE.USER, value: 'client_info' },
        { type: CONFIG_TYPE.USER, value: 'extension_info' },
        { type: CONFIG_TYPE.USER, value: 'role_permissions' },
        { type: CONFIG_TYPE.USER, value: 'special_number_rule' },
        { type: CONFIG_TYPE.GLOBAL, value: 'PHONE_DATA' },
        { type: CONFIG_TYPE.USER, value: 'PHONE_DATA_VERSION' },
      ],
    },
  },
};

export { MODULE_NAME, RC_INFO_KEYS, RC_INFO_GLOBAL_KEYS, RC_INFO_HISTORY };
