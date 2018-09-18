/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-06-06 10:17:59
 * Copyright © RingCentral. All rights reserved.
 */
export type BaseModel = {
  id: number;
  _id?: number;
};

export type ExtendedBaseModel = BaseModel & {
  created_at: number;
  modified_at: number;
  creator_id: number;
  is_new: boolean;
  deactivated: boolean;
  version: number;
  model_id?: string;
  model_size?: number;
}

export type Raw<T> = Pick<T, Exclude<keyof T, 'id'>> & {
  _id: number;
  id?: number;
};
export type PartialWithKey<T> = Pick<T, Extract<keyof T, 'id'>> & Partial<T>;

export type Group = ExtendedBaseModel & {
  members: number[];
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
  privacy?: string; // 'public'|'protected'|'private'
  team_folder?: string;
  converted_to_team?: object;
  converted_from_group?: object;
  pinned_post_ids?: number[];
  permissions?: {
    admin?: {
      uids: number[];
      level?: number;
    };
    user?: {
      uids: number[];
      level?: number;
    };
  };
  post_cursor?: number;
  drp_post_cursor?: number;
  trigger_ids?: number[]
  deactivated_post_cursor?: number;
  _delta?: { add?: object, remove?: object, set?: object };
  is_public?: boolean;
  description?: string;
};

export type Profile = ExtendedBaseModel & {
  person_id?: number;
  favorite_group_ids: number[];
  favorite_post_ids: number[];
};

export type Company = ExtendedBaseModel & {
  name: string;
  domain: string;
  admins: number[];
};

export type Person = ExtendedBaseModel & {
  company_id: number;
  email: string;
  is_webmail?: boolean;
  first_user?: boolean;
  externally_registered?: boolean;
  state_id?: number;
  profile_id?: number;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  headshot?: {
    url: string,
  };
  locked?: boolean;
  inviter_id?: number;
  rc_phone_numbers?: object[];
  sanitized_rc_extension?: object;
  is_pseudo_user?: boolean;
  glip_user_id?: number;
};

export type UserInfo = {
  email: string;
  display_name: string;
  company_id: number;
};

export type State = ExtendedBaseModel & {
  person_id: number;
  current_group_id: number;
  away_status_history?: string[];
  current_plugin: string;
  trigger_ids?: number[]
};

export type MyState = State;

export type GroupState = {
  id: number;
  unread_count?: number;
  unread_mentions_count?: number;
  read_through?: number;
  last_read_through?: number;
  marked_as_unread?: boolean;
  post_cursor?: number;
  unread_deactivated_count?: number;
  group_post_cursor?: number;
  group_post_drp_cursor?: number;
  trigger_ids?: number[]
};

export type Post = ExtendedBaseModel & {
  group_id: number;
  company_id: number;
  text: string;
  item_ids: number[];
  post_ids: number[]; // quoted posts
  likes?: number[];
  activity?: string;
  at_mention_item_ids?: number[];
  at_mention_non_item_ids?: number[];
  new_version?: number;
  from_group_id?: number;
  links?: object[];
  items?: object[];
};

export type Item = ExtendedBaseModel & {
  group_ids: number[];
  post_ids: number[];
  company_id: number;
  type_id: number;
};

export type FileItem = Item & {
  name: string;
};

export type NoteItem = Item & {
  body: string;
  title: string;
};

export type StoredFile = Raw<ExtendedBaseModel> & {
  storage_url: string;
  download_url: string;
  storage_path: string;
  last_modified: number;
  size: number;
};

export type RawPresence = {
  person_id: number;
  presence: 'default' | 'offline' | 'online' | 'away' | undefined;
}

export type Presence = BaseModel & {
  presence: 'default' | 'offline' | 'online' | 'away' | undefined;
};
