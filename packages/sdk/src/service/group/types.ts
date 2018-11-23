/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-03 18:26:15
 * Copyright © RingCentral. All rights reserved.
 */

type GroupQueryType = 'all' | 'group' | 'team' | 'favorite';

enum FEATURE_ACTION_STATUS {
  INVISIBLE,
  ENABLE,
  DISABLE,
}

enum FEATURE_TYPE {
  MESSAGE,
  CALL,
  VIDEO,
  CONFERENCE,
}

export { GroupQueryType, FEATURE_ACTION_STATUS, FEATURE_TYPE };
