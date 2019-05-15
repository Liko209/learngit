/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-08 09:38:08
 * Copyright © RingCentral. All rights reserved.
 */

enum CONFIG_TYPE {
  DB,
  USER,
  GLOBAL,
}

const GLOBAL_NAME = 'global';

const VERSION_KEY = 'version';

enum CONFIG_EVENT_TYPE {
  UPDATE,
  REMOVE,
}

export { CONFIG_TYPE, GLOBAL_NAME, VERSION_KEY, CONFIG_EVENT_TYPE };
