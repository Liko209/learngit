/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-23 15:45:28
 * Copyright © RingCentral. All rights reserved.
 */

enum TASK_DATA_TYPE {
  STATE,
  GROUP_CURSOR,
  STATE_AND_GROUP_CURSOR,
  GROUP_STATE,
  GROUP_ENTITY,
  PROFILE_ENTITY,
}

const ModuleName = 'GroupState';

const GROUP_BADGE_TYPE = {
  TEAM: `${ModuleName}.TEAM`,
  DIRECT_MESSAGE: `${ModuleName}.DIRECT_MESSAGE`,
  FAVORITE_TEAM: `${ModuleName}.FAVORITE_TEAM`,
  FAVORITE_DM: `${ModuleName}.FAVORITE_DM`,
};

enum GROUP_STATE_KEY {
  DEACTIVATED_POST_CURSOR = 'deactivated_post_cursor',
  GROUP_MISSED_CALLS_COUNT = 'group_missed_calls_count',
  GROUP_TASKS_COUNT = 'group_tasks_count',
  LAST_READ_THROUGH = 'last_read_through',
  UNREAD_MENTIONS_COUNT = 'unread_mentions_count',
  READ_THROUGH = 'read_through',
  MARKED_AS_UNREAD = 'marked_as_unread',
  POST_CURSOR = 'post_cursor',
  PREVIOUS_POST_CURSOR = 'previous_post_cursor',
  UNREAD_DEACTIVATED_COUNT = 'unread_deactivated_count',
  TEAM_MENTION_CURSOR = 'team_mention_cursor',
  GROUP_POST_CURSOR = 'group_post_cursor',
  GROUP_POST_DRP_CURSOR = 'group_post_drp_cursor',
  LAST_AUTHOR_ID = 'last_author_id',
  TEAM_MENTION_CURSOR_OFFSET = 'team_mention_cursor_offset',
  GROUP_TEAM_MENTION_CURSOR = 'group_team_mention_cursor',
  REMOVED_CURSORS_TEAM_MENTION = 'removed_cursors_team_mention',
  GROUP_ADMIN_MENTION_CURSOR = 'group_team_mention_cursor',
  ADMIN_MENTION_CURSOR_OFFSET = 'admin_mention_cursor_offset',
  REMOVED_CURSORS_ADMIN_MENTION = 'admin_mention_cursor_offset'
}

enum GROUP_KEY {
  __TRIGGER_IDS = '__trigger_ids',
  POST_CURSOR = 'post_cursor',
  POST_DRP_CURSOR = 'post_drp_cursor',
  LAST_AUTHOR_ID = 'last_author_id',
  TEAM_MENTION_CURSOR_OFFSET = 'team_mention_cursor_offset',
  TEAM_MENTION_CURSOR = 'team_mention_cursor',
  REMOVED_CURSORS_TEAM_MENTION = 'removed_cursors_team_mention',
  ADMIN_MENTION_CURSOR = 'admin_mention_cursor',
  ADMIN_MENTION_CURSOR_OFFSET = 'admin_mention_cursor_offset',
  REMOVED_CURSORS_ADMIN_MENTION = 'admin_mention_cursor_offset'
}

export {
  TASK_DATA_TYPE,
  ModuleName,
  GROUP_BADGE_TYPE,
  GROUP_STATE_KEY,
  GROUP_KEY,
};
