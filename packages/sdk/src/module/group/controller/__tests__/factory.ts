import { Sync as Factory } from 'factory.ts';
import faker from 'faker';
import { Group } from '../../entity';
import { ExtendedBaseModel } from '../../../models';

const uniqueNumber = () =>
  Factory.each(i => faker.random.number(Date.now() + i));

const base = {
  id: uniqueNumber(),
  created_at: uniqueNumber(),
  creator_id: uniqueNumber(),
  version: uniqueNumber(),
  model_size: faker.random.number(1000),
  is_new: faker.random.boolean(),
  model_id: uniqueNumber().toString(),
  modified_at: uniqueNumber(),
  deactivated: false,
};
export const baseModelFactory = Factory.makeFactory<ExtendedBaseModel>(base);
// Group
const group = {
  members: [faker.random.number(100000000)],
  company_id: faker.random.number(100000000),
  email_friendly_abbreviation: 'Me',
  set_abbreviation: 'Me',
  privacy: faker.random.arrayElement(['private', 'protected', 'public']),
  is_team: faker.random.boolean(),
  most_recent_content_modified_at: uniqueNumber(),
  most_recent_post_id: uniqueNumber(),
  most_recent_post_created_at: uniqueNumber(),
  post_cursor: faker.random.number(1000),
  deactivated_post_cursor: faker.random.number(1000),
  is_company_team: false,
};
export const groupFactory = Factory.makeFactory<Group>({
  ...base,
  ...group,
});

export const fullTeam = {
  id: 23732230,
  _id: 23732230,
  created_at: 1551941477640,
  creator_id: 229379,
  version: 1653252888199168,
  model_size: 0,
  is_new: false,
  members: [32771, 40963, 221187, 229379, 270339, 458755],
  is_team: true,
  is_public: false,
  privacy: 'private',
  set_abbreviation:
    'TEAM: Maye Stamm New, Mia Cai, William Ye, Yilia Hong and Zack Zheng',
  converted_from_group: { group_id: 262512642, at: 1551941477628 },
  guest_user_company_ids: [],
  company_id: 16385,
  email_friendly_abbreviation:
    'team__maye_stamm_new__mia_cai__william_ye__yilia_hong_and_zack_zheng',
  permissions: {
    admin: { uids: [229379], level: 63 },
    user: { uids: [32771, 40963, 221187, 458755], level: 1 },
  },
  most_recent_content_modified_at: 1552633160165,
  modified_at: 1552633160165,
  deactivated: false,
  most_recent_post_id: 2340757508,
  most_recent_post_created_at: 1552633143174,
  post_cursor: 13,
  description: '',
  model_id: '23732230',
  new_version: 3911648588176614,
  _changed: ['new_version', 'deltas', 'permissions', 'privacy'],
  request_id: 302,
  _csrf: null,
};
