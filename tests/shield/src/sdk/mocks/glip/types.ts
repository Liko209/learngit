/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Company } from 'sdk/module/company/entity';
import { Group } from 'sdk/module/group/entity';
import { Item } from 'sdk/module/item/entity';
import { Person } from 'sdk/module/person/entity';
import { Post } from 'sdk/module/post/entity';
import { Profile } from 'sdk/module/profile/entity';

export type GlipBase = {
  _id: number;
  id?: number;
  created_at: number;
  modified_at: number;
  creator_id: number;
  is_new: boolean;
  deactivated: boolean;
  version: number;
  model_id?: string;
  model_size?: number;
};

type ToMongo<T> = Omit<T, 'id'> & { _id: number };

export type GlipGroup = ToMongo<Group> & {
  most_recent_content_modified_at: number;
  most_recent_post_id: number;
  most_recent_post_created_at: number;
  team_mention_cursor: number;
  admin_mention_cursor: number;
  post_cursor: number;
  last_author_id?: number;
};
export type GlipProfile = ToMongo<Profile>;
export type GlipPerson = ToMongo<Omit<Person, 'me_group_id'>>;
export type GlipCompany = ToMongo<Omit<Company, 'custom_emoji'>>;
export type GlipPost = ToMongo<Post>;
export type GlipItem = ToMongo<Item>;
export type GlipState = GlipBase & {
  person_id: number;
  // [key: string]: number;
};
export type GlipGroupState = GlipBase & {
  // person_id: number;
  // [key: string]: number;
  group_id: number;
  post_cursor: number;
  read_through: number;
  unread_count: number;
  unread_mentions_count: number;
  unread_deactivated_count: number;
  marked_as_unread: boolean;

  deactivated_post_cursor: number;
  group_missed_calls_count: number;
  group_tasks_count: number;
  last_read_through: number;
  previous_post_cursor: number;
};

export type GlipClientConfig = GlipBase & {
  dnd_notifications_beta_companies: string;
  presence_beta_emails: string;
  presence_beta_domain: string;
  'Presence2.0Email': string;
  presence_beta: string;
  presence_webdesktop_all: string;
  enable_email_monitor: string;
  search_facade_base_paths: string;
  search_facade_indexing_global_path: string;
  search_facade_searching_global_path: string;
  code_snippets_beta_all: string;
  beta_s3_direct_uploads_accelerated: string;
  beta_s3_direct_uploads: string;
  limit_people_broadcast_all: string;
  limit_people_broadcast_emails: string;
  limit_people_broadcast_domains: string;
  suppress_invitee_emails: string;
  team_mention_emails: string;
  team_mention_domains: string;
  team_mention_all: string;
  reconnect_backoff_point: string;
  reconnect_economy_multiplier: string;
  reconnect_emergency_restart_time: string;
  reconnect_enabled: string;
  reconnect_failure_point: string;
  reconnect_increment: string;
  reconnect_initial_window: string;
  custom_status_domains: string;
  custom_status_all: string;
  old_umi_disabled: string;
  beta_rcv_api2_domains: string;
  ui_consistency_beta_all: string;
  ui_consistency_beta_domains: string;
  ui_consistency_beta_emails: string;
  Force_Logout_Percentage: string;
};

export type GlipModel =
  | GlipState
  | GlipGroup
  | GlipProfile
  | GlipCompany
  | GlipPost
  | GlipPerson
  | GlipItem
  | GlipGroupState
  | GlipClientConfig;

export type InitialData = {
  user_id: number;
  company_id: number;
  profile: GlipProfile;
  companies: GlipCompany[];
  items: GlipItem[];
  // presences?: Presence[];
  state: GlipState;
  people: GlipPerson[];
  public_teams: GlipGroup[];
  groups: GlipGroup[];
  teams: GlipGroup[];
  posts: GlipPost[];
  max_posts_exceeded?: boolean;
  timestamp: number;
  scoreboard: string;
  client_config: GlipClientConfig;
  // static_http_server: string;
};

export type GlipData = {
  company: GlipCompany;
  user: GlipPerson;
  people: GlipPerson[];
  groups: GlipGroup[];
  teams: GlipGroup[];
  posts: GlipPost[];
  clientConfig: GlipClientConfig;
  state: GlipState;
  groupState: GlipGroupState[];
  profile: GlipProfile;
};
