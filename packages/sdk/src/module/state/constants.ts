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

const ModuleName = 'GroupState';

const GROUP_BADGE_TYPE = {
  TEAM: `${ModuleName}.TEAM`,
  DIRECT_MESSAGE: `${ModuleName}.DIRECT_MESSAGE`,
  FAVORITE_TEAM: `${ModuleName}.FAVORITE_TEAM`,
  FAVORITE_DM: `${ModuleName}.FAVORITE_DM`,
};

enum GROUP_STATE_KEY {
  'deactivated_post_cursor' = 'deactivated_post_cursor',
  'group_missed_calls_count' = 'group_missed_calls_count',
  'group_tasks_count' = 'group_tasks_count',
  'last_read_through' = 'last_read_through',
  'unread_mentions_count' = 'unread_mentions_count',
  'read_through' = 'read_through',
  'marked_as_unread' = 'marked_as_unread',
  'post_cursor' = 'post_cursor',
  'previous_post_cursor' = 'previous_post_cursor',
  'unread_deactivated_count' = 'unread_deactivated_count',
  'team_mention_cursor' = 'team_mention_cursor',
}

enum GROUP_KEY {
  '__trigger_ids' = '__trigger_ids',
  'post_cursor' = 'post_cursor',
  'post_drp_cursor' = 'post_drp_cursor',
  'last_author_id' = 'last_author_id',
  'team_mention_cursor_offset' = 'team_mention_cursor_offset',
  'team_mention_cursor' = 'team_mention_cursor',
  'removed_cursors_team_mention' = 'removed_cursors_team_mention',
}

export {
  TASK_DATA_TYPE,
  ModuleName,
  GROUP_BADGE_TYPE,
  GROUP_STATE_KEY,
  GROUP_KEY,
};
