/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 13:35:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';

type GroupQueryType = 'all' | 'group' | 'team' | 'favorite';

enum FEATURE_STATUS {
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

type TeamPermission = {
  admin?: {
    uids: number[];
    level?: number;
  };
  user?: {
    uids: number[];
    level?: number;
  };
};

type GroupCommon = {
  company_id: number;
  set_abbreviation: string;
  email_friendly_abbreviation: string;
  most_recent_content_modified_at: number;
  most_recent_post_created_at?: number;
  most_recent_post_id?: number;
  is_team?: boolean;
  is_archived?: boolean;
  guest_user_company_ids?: number[];
  removed_guest_user_ids?: number[];
  privacy?: string; // 'protected'|'private'
  team_folder?: string;
  converted_to_team?: object;
  converted_from_group?: object;
  pinned_post_ids?: number[];
  permissions?: TeamPermission;
  post_cursor?: number;
  drp_post_cursor?: number;
  deactivated_post_cursor?: number;
  _delta?: { add?: object; remove?: object; set?: object };
  is_public?: boolean;
  description?: string;
  __send_failure_post_ids?: number[];
  __draft?: string;
  __last_accessed_at?: number;
};

type Group = ExtendedBaseModel & {
  members: number[];
} & GroupCommon;

export {
  GroupQueryType,
  FEATURE_STATUS,
  FEATURE_TYPE,
  TeamPermission,
  Group,
  GroupCommon,
};
