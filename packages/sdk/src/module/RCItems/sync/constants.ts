/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-14 15:11:06
 * Copyright © RingCentral. All rights reserved.
 */

enum SYNC_TYPE {
  ISYNC = 'ISync',
  FSYNC = 'FSync',
}

enum SYNC_STATUS {
  IN_FSYNC = 1 << 0,
  IN_CLEAR = 1 << 1,
}

const SILENT_SYNC_INTERVAL = 30 * 1000;

const DEFAULT_REQUEST_SYNC_INTERVAL = 30 * 1000;

const MAX_RECORD_COUNT = 250;

const DEFAULT_RECORD_COUNT = 50;

export {
  SYNC_TYPE,
  SYNC_STATUS,
  SILENT_SYNC_INTERVAL,
  DEFAULT_REQUEST_SYNC_INTERVAL,
  MAX_RECORD_COUNT,
  DEFAULT_RECORD_COUNT,
};
