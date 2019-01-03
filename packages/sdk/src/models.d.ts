/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-06-06 10:17:59
 * Copyright © RingCentral. All rights reserved.
 */
import { TeamPermission } from './service/group';
import { PRESENCE } from './service';
import { PROGRESS_STATUS } from './module';

export type BaseModel = {
  id: number;
  _id?: number;
};

export type SortableModel<T> = {
  id: number;
  displayName: string;
  firstSortKey?: any;
  secondSortKey?: any;
  entity: T;
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
};

export type IResponseError = {
  error: {
    code: string;
    message: string;
    validation: boolean;
  };
};

export type Raw<T> = Pick<T, Exclude<keyof T, 'id'>> & {
  _id: number;
  id?: number;
} & IResponseError;

export type PartialWithKey<T> = Pick<T, Extract<keyof T, 'id'>> & Partial<T>;

export type GroupCommon = {
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
  __trigger_ids?: number[];
  deactivated_post_cursor?: number;
  _delta?: { add?: object; remove?: object; set?: object };
  is_public?: boolean;
  description?: string;
  __last_accessed_at?: number;
};

export type Group = ExtendedBaseModel & {
  members: number[];
} & GroupCommon;

export type GroupApiType = ExtendedBaseModel & {
  members: (number | string)[];
} & GroupCommon;

export type Profile = ExtendedBaseModel & {
  person_id?: number;
  favorite_group_ids: number[];
  favorite_post_ids: number[];
  skip_close_conversation_confirmation?: boolean;
  me_tab: boolean;
  max_leftrail_group_tabs2?: number;
};

export type Company = ExtendedBaseModel & {
  name: string;
  domain: string | string[];
  admins: number[];
  custom_emoji: { [index: string]: { data: string } };
  _delta?: { add_keys?: object; remove_keys: object };
  rc_account_id?: number;
  webmail_person_id?: number;
};

export type PhoneNumberModel = {
  id: number;
  phoneNumber: string;
  usageType: string;
};

export type SanitizedExtensionModel = {
  extensionNumber: string;
  type: string;
};

export type Person = ExtendedBaseModel & {
  company_id: number;
  email: string;
  me_group_id: number;
  is_webmail?: boolean;
  first_user?: boolean;
  externally_registered?: boolean;
  state_id?: number;
  profile_id?: number;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  headshot?: {
    url: string;
  };
  headshot_version?: string;
  locked?: boolean;
  inviter_id?: number;
  rc_phone_numbers?: PhoneNumberModel[];
  sanitized_rc_extension?: SanitizedExtensionModel;
  is_pseudo_user?: boolean;
  glip_user_id?: number;
  away_status?: string;
  job_title?: string;
  pseudo_user_phone_number?: string;
  rc_account_id?: number;
  location?: string;
  homepage?: string;
  teams_removed_from?: number[];
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
  __trigger_ids?: number[];
  last_group_id: number;
  at_mentioning_post_ids?: number[];
};

export type MyState = State;

export type GroupState = {
  id: number;
  unread_count?: number;
  unread_mentions_count?: number;
  read_through?: number;
  last_read_through?: number; // last post of the group
  marked_as_unread?: boolean;
  post_cursor?: number;
  unread_deactivated_count?: number;
  group_post_cursor?: number;
  group_post_drp_cursor?: number;
  __trigger_ids?: number[];
};

export type GroupConfig = {
  id: number; // group id
  has_more_older?: boolean;
  has_more_newer?: boolean;
  is_newest_saved?: boolean;
  draft?: string;
  send_failure_post_ids?: number[];
};

export type PostItemData = {
  version_map: { [key: number]: number };
};

export type Post = ExtendedBaseModel & {
  group_id: number;
  company_id: number;
  text: string;
  item_id?: number;
  item_ids: number[];
  post_ids: number[]; // quoted posts
  likes?: number[];
  activity?: string;
  activity_data?: object;
  at_mention_item_ids?: number[];
  at_mention_non_item_ids?: number[];
  new_version?: number; // This field should be moved to base model?
  from_group_id?: number;
  item_data?: PostItemData;
  links?: object[];
  items?: object[];
  source?: string;
  parent_id?: number;
};

export type ItemVersionPage = {
  file_id: number;
  url: string;
};

export type ItemVersions = {
  download_url: string;
  size: number;
  url: string;
  thumbs?: any;
  length?: number; // document preview
  orig_height?: number;
  orig_width?: number;
  pages?: ItemVersionPage[];
};

export type Item = ExtendedBaseModel & {
  group_ids: number[];
  post_ids: number[];
  company_id: number;
  is_document?: boolean;
  name: string; // file name
  type_id: number; // file type
  type: string; // file type .jpg .exe
  versions: ItemVersions[];
  summary?: string;
  title?: string;
  url?: string;
  image?: string;
  do_not_render?: boolean;
};

export type TaskItem = Item & {
  color: string;
  complete: boolean;
  notes: string;
  start: number;
  end: number;
  section: string;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: string;
  text: string;
  due: number;
  complete_type: string;
  assigned_to_ids: number[];
  complete_people_ids: number[];
  attachment_ids: number[];
  complete_percentage: number;
};

export type EventItem = Item & {
  color: string;
  description: string;
  start: number;
  end: number;
  location: string;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: string;
  text: string;
};

export type ItemFile = Item & {
  name: string;
};

export type NoteItem = Item & {
  body: string;
  title: string;
  summary: string;
};

export type LinkItem = Item & {
  favicon: string;
  providerName: string;
  summary: string;
  title: string;
  url: string;
  image: string;
  data: {
    provider_name: string;
  };
};

export type StoredFile = Raw<ExtendedBaseModel> & {
  storage_url: string;
  download_url: string;
  storage_path: string;
  last_modified: number;
  size: number;
};

export type RawPresence = {
  personId: number;
  calculatedStatus?: PRESENCE;
};

export type Presence = BaseModel & {
  presence: RawPresence['calculatedStatus'];
};

export type Progress = BaseModel & {
  rate?: { total: number; loaded: number };
  status?: PROGRESS_STATUS;
};
