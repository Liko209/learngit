/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-13 23:59:29
 * Copyright © RingCentral. All rights reserved.
 */

const MAX_PERMISSION_LEVEL = 63;
const DEFAULT_ADMIN_PERMISSION_LEVEL = 63;
const DEFAULT_USER_PERMISSION_LEVEL = 15;
const DEFAULT_GUEST_PERMISSION_LEVEL = 5;

enum PERMISSION_ENUM {
  TEAM_POST = 1,
  TEAM_ADD_MEMBER = 2,
  TEAM_ADD_INTEGRATIONS = 4,
  TEAM_PIN_POST = 8,
  TEAM_ADMIN = 16,
  TEAM_MENTION = 32,
}

enum GROUP_CAN_NOT_SHOWN_REASON {
  DEACTIVATED,
  ARCHIVED,
  HIDDEN,
  NOT_INCLUDE_SELF,
  NOT_AUTHORIZED,
  UNKNOWN,
}

const TEAM_ADDITION_MOVE_PROPERTIES = [
  'team_mention_cursor_offset',
  'team_mention_cursor',
  'removed_cursors_team_mention',
  'admin_mention_cursor',
  'admin_mention_cursor_offset',
  'removed_cursors_admin_mention',
];

export {
  MAX_PERMISSION_LEVEL,
  PERMISSION_ENUM,
  DEFAULT_ADMIN_PERMISSION_LEVEL,
  DEFAULT_USER_PERMISSION_LEVEL,
  DEFAULT_GUEST_PERMISSION_LEVEL,
  GROUP_CAN_NOT_SHOWN_REASON,
  TEAM_ADDITION_MOVE_PROPERTIES,
};
