/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-19 13:13:15
 * Copyright © RingCentral. All rights reserved.
 */

const PERMISSION_PLATFORM = {
  SPLIT: 'SPLIT',
  LD: 'LD',
};

const PERMISSION_CONTROLLED_BY = {
  JUPITER_CREATE_TEAM: PERMISSION_PLATFORM.LD,
  JUPITER_SEND_NEW_MESSAGE: PERMISSION_PLATFORM.SPLIT,
};

export { PERMISSION_CONTROLLED_BY, PERMISSION_PLATFORM };
