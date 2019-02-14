/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:45:28
 * Copyright © RingCentral. All rights reserved.
 */

enum TASK_DATA_TYPE {
  STATE,
  GROUP_STATE,
  GROUP_CURSOR,
  GROUP_ENTITY,
  PROFILE_ENTITY,
}

enum UMI_SECTION_TYPE {
  SINGLE,
  FAVORITE,
  DIRECT_MESSAGE,
  TEAM,
  ALL,
}

export { TASK_DATA_TYPE, UMI_SECTION_TYPE };
