/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:20:33
 * Copyright © RingCentral. All rights reserved.
 */
import * as Factory from 'factory.ts';
import faker from 'faker';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';

import {
  GlipClientConfig,
  GlipCompany,
  GlipGroup,
  GlipGroupState,
  GlipPerson,
  GlipPost,
  GlipProfile,
  GlipState,
} from '../types';
import { genId } from '../utils';

const each = <T>(f: (seqNum: number) => T) => Factory.each(f);

const idGenerator = (table: string, typeId: number) =>
  each(() => genId(table, typeId));

const uniqueNumber = () => each(i => faker.random.number(Date.now() + i));
const uniqueStringNumber = () =>
  each(i => String(faker.random.number(Date.now() + i)));
const startTime = 1560016277707;
const fakeTimestamp = each(i => startTime + i * 1234);
const fakeEmail = each(() => faker.internet.email());

const base = {
  _id: uniqueNumber(),
  created_at: fakeTimestamp,
  creator_id: uniqueNumber(),
  version: 1,
  model_size: faker.random.number(1000),
  is_new: false,
  model_id: each(i => `${faker.random.number(Date.now() + i)}`),
  modified_at: fakeTimestamp,
  deactivated: false,
};

const companyFactory = Factory.Sync.makeFactory<GlipCompany>({
  ...base,
  _id: idGenerator('company', TypeDictionary.TYPE_ID_COMPANY),
  name: faker.company.companyName(),
  domain: faker.internet.domainName(),
  admins: [faker.random.number(10000)],
});

const userFactory = Factory.Sync.makeFactory<GlipPerson>({
  ...base,
  _id: idGenerator('person', TypeDictionary.TYPE_ID_PERSON),
  email: fakeEmail,
  first_name: faker.name.findName(),
  last_name: faker.name.lastName(),
  company_id: faker.random.number(100000000),
  headshot: faker.image.imageUrl(),
  sanitized_rc_extension: { extensionNumber: '2013', type: 'User' },
  rc_phone_numbers: [
    { id: 536322020, phoneNumber: '16504463168', usageType: 'DirectNumber' },
    {
      id: 36525942,
      phoneNumber: '18885287464',
      usageType: 'MainCompanyNumber',
    },
  ],
  first_user: false,
});

const personFactory = Factory.Sync.makeFactory<GlipPerson>({
  ...base,
  _id: idGenerator('person', TypeDictionary.TYPE_ID_PERSON),
  email: fakeEmail,
  first_name: faker.name.findName(),
  last_name: faker.name.lastName(),
  company_id: faker.random.number(100000000),
  headshot: faker.image.imageUrl(),
  sanitized_rc_extension: { extensionNumber: '2013', type: 'User' },
  rc_phone_numbers: [
    { id: 536322020, phoneNumber: '16504463168', usageType: 'DirectNumber' },
    {
      id: 36525942,
      phoneNumber: '18885287464',
      usageType: 'MainCompanyNumber',
    },
  ],
  first_user: false,
});

const groupFactory = Factory.Sync.makeFactory<GlipGroup>({
  ...base,
  _id: idGenerator('group', TypeDictionary.TYPE_ID_GROUP),
  members: [faker.random.number(100000000)],
  company_id: faker.random.number(100000000),
  email_friendly_abbreviation: fakeEmail,
  set_abbreviation: each(i => `Group ${i} + ${faker.commerce.productName()}`),
  privacy: 'public',
  is_team: false,
  most_recent_content_modified_at: 0,
  most_recent_post_id: 0,
  most_recent_post_created_at: 0,
  deactivated_post_cursor: 0,
  is_company_team: false,
  team_mention_cursor: 0,
  admin_mention_cursor: 0,
  post_cursor: 0,
});

const teamFactory = groupFactory.extend({
  _id: idGenerator('group', TypeDictionary.TYPE_ID_TEAM),
  privacy: each(() =>
    faker.random.arrayElement(['private', 'protected', 'public']),
  ),
  // set_abbreviation: `Team ${faker.name.firstName()}-${faker.name.lastName()}`,
  set_abbreviation: each(i => `Team ${i} + ${faker.commerce.productName()}`),
  is_team: true,
  permissions: {
    admin: {
      uids: [],
    },
    user: {
      uids: [],
    },
  },
});

const postFactory = Factory.Sync.makeFactory<GlipPost>({
  ...base,
  _id: idGenerator('post', TypeDictionary.TYPE_ID_POST),
  unique_id: uniqueStringNumber(),
  item_ids: [],
  post_ids: [],
  group_id: faker.random.number(100000000),
  text: faker.lorem.lines(),
  company_id: faker.random.number(100000000),
  at_mention_item_ids: [],
  at_mention_non_item_ids: [],
});

const clientConfigFactory = Factory.Sync.makeFactory<GlipClientConfig>({
  ...base,
  dnd_notifications_beta_companies: 'all',
  presence_beta_emails: 'all',
  presence_beta_domain: 'all',
  'Presence2.0Email': 'all',
  presence_beta: 'true',
  presence_webdesktop_all: 'true',
  enable_email_monitor: 'true',
  search_facade_base_paths:
    '{"v1": "http://gdx02-t01-gsf01.asialab.glip.net:8080"}',
  search_facade_indexing_global_path: 'v1',
  search_facade_searching_global_path: 'v1',
  code_snippets_beta_all: 'true',
  beta_s3_direct_uploads_accelerated: 'on',
  beta_s3_direct_uploads: 'on',
  limit_people_broadcast_all: 'off',
  limit_people_broadcast_emails: '',
  limit_people_broadcast_domains: '',
  suppress_invitee_emails: 'on',
  team_mention_emails: '',
  team_mention_domains: '',
  team_mention_all: 'true',
  reconnect_backoff_point: '300',
  reconnect_economy_multiplier: '100',
  reconnect_emergency_restart_time: '0',
  reconnect_enabled: 'false',
  reconnect_failure_point: '500',
  reconnect_increment: '100',
  reconnect_initial_window: '1000',
  custom_status_domains: '',
  custom_status_all: 'false',
  old_umi_disabled: 'false',
  beta_rcv_api2_domains: 'all',
  ui_consistency_beta_all: 'false',
  ui_consistency_beta_domains: '',
  ui_consistency_beta_emails: '',
  Force_Logout_Percentage: '',
});
const stateFactory = Factory.Sync.makeFactory<GlipState>({
  ...base,
  _id: idGenerator('state', TypeDictionary.TYPE_ID_STATE),
  person_id: uniqueNumber(),
});

const groupStateFactory = Factory.Sync.makeFactory<GlipGroupState>({
  ...base,
  group_id: uniqueNumber(),
  post_cursor: 0,
  read_through: 0,
  unread_count: 0,
  unread_mentions_count: 0,
  unread_deactivated_count: 0,
  marked_as_unread: false,

  deactivated_post_cursor: 0,
  group_missed_calls_count: 0,
  group_tasks_count: 0,
  last_read_through: 0,
  previous_post_cursor: 0,
});
const profileFactory = Factory.Sync.makeFactory<GlipProfile>({
  ...base,
  _id: idGenerator('profile', TypeDictionary.TYPE_ID_PROFILE),
  person_id: uniqueNumber(),
  me_tab: true,
  favorite_group_ids: [],
  favorite_post_ids: [],
  // want_email_people: EMAIL_NOTIFICATION_OPTIONS.OFF,
  // want_email_team: EMAIL_NOTIFICATION_OPTIONS.OFF,
  // want_push_team: MOBILE_TEAM_NOTIFICATION_OPTIONS.OFF,
  // want_push_people: NOTIFICATION_OPTIONS.OFF,
  // want_email_mentions: NOTIFICATION_OPTIONS.OFF,
  // want_push_mentions: NOTIFICATION_OPTIONS.OFF,
  // want_push_video_chat: NOTIFICATION_OPTIONS.OFF,
  // want_email_glip_today: NOTIFICATION_OPTIONS.OFF,
  // new_message_badges: NEW_MESSAGE_BADGES_OPTIONS.ALL,

  // want_push_missed_calls_and_voicemails: 1,
  // send_push_notifications_ignoring_presence: 0,
  // send_email_notifications_ignoring_presence: 0,
  // has_new_notification_defaults: true,
});

export {
  companyFactory,
  userFactory,
  personFactory,
  groupFactory,
  teamFactory,
  postFactory,
  clientConfigFactory,
  stateFactory,
  groupStateFactory,
  profileFactory,
};
