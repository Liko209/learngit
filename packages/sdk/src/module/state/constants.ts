/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:45:28
 * Copyright © RingCentral. All rights reserved.
 */

enum TASK_TYPE {
  HANDLE_STATE,
  HANDLE_GROUP_STATE,
  HANDLE_GROUP_CURSOR,
  HANDLE_GROUP_ENTITY,
  HANDLE_PROFILE_ENTITY,
}

enum UMI_SECTION_TYPE {
  SINGLE,
  FAVORITE,
  DIRECT_MESSAGE,
  TEAM,
  ALL,
}

export { TASK_TYPE, UMI_SECTION_TYPE };
