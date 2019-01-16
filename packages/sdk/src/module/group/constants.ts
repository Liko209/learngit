/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-13 23:59:29
 * Copyright © RingCentral. All rights reserved.
 */

const MAX_PERMISSION_LEVEL = 31;

enum PERMISSION_ENUM {
  TEAM_POST = 1,
  TEAM_ADD_MEMBER = 2,
  TEAM_ADD_INTEGRATIONS = 4,
  TEAM_PIN_POST = 8,
  TEAM_ADMIN = 16,
}

export { MAX_PERMISSION_LEVEL, PERMISSION_ENUM };
