import Factory from 'factory.ts';
import faker from 'faker';
import {
  MyState, Post, Item, Company, Group, Person,
  Profile, BaseModel, StoredFile, Raw,
} from '../models';

const uniqueNumber = () => Factory.each(i => faker.random.number(Date.now() + i));

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
const rawBase = {
  _id: uniqueNumber(),
  created_at: uniqueNumber(),
  creator_id: uniqueNumber(),
  version: uniqueNumber(),
  model_size: faker.random.number(1000),
  is_new: faker.random.boolean(),
  model_id: uniqueNumber().toString(),
  modified_at: uniqueNumber(),
  deactivated: false,
};
export const baseModelFactory = Factory.makeFactory<BaseModel>(base);
export const rawBaseModelFactory = Factory.makeFactory<Raw<BaseModel>>(rawBase);

// MyState
const myState = {
  person_id: 3592527875,
  current_group_id: 4325408770,
  current_plugin: 'events',
};
export const myStateFactory = Factory.makeFactory<MyState>({
  ...base,
  ...myState,
});
export const rawMyStateFactory = Factory.makeFactory<Raw<MyState>>({
  ...rawBase,
  ...myState,
});

// Post
const post = {
  item_ids: [],
  post_ids: [],
  group_id: faker.random.number(100000000),
  text: faker.lorem.lines(),
  company_id: faker.random.number(100000000),
  at_mention_item_ids: [],
  at_mention_non_item_ids: [],
};
export const postFactory = Factory.makeFactory<Post>({
  ...base,
  ...post,
});
export const rawPostFactory = Factory.makeFactory<Raw<Post>>({
  ...rawBase,
  ...post,
});

// Item
const item = {
  post_ids: [faker.random.number(100000000)],
  group_ids: [faker.random.number(100000000)],
  company_id: faker.random.number(100000000),
  type_id: faker.random.number(100),
};
export const itemFactory = Factory.makeFactory<Item>({
  ...base,
  ...item,
});
export const rawItemFactory = Factory.makeFactory<Raw<Item>>({
  ...rawBase,
  ...item,
});

// Company
const company = {
  name: faker.company.companyName(),
  domain: faker.internet.domainName(),
  admins: [faker.random.number(10000)],
};
export const companyFactory = Factory.makeFactory<Company>({
  ...base,
  ...company,
});
export const rawCompanyFactory = Factory.makeFactory<Raw<Company>>({
  ...rawBase,
  ...company,
});

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
};
export const groupFactory = Factory.makeFactory<Group>({
  ...base,
  ...group,
});
export const rawGroupFactory = Factory.makeFactory<Raw<Group>>({
  ...rawBase,
  ...group,
});

// Person
const person = {
  email: faker.internet.email(),
  first_name: faker.name.findName(),
  last_name: faker.name.lastName(),
  company_id: faker.random.number(100000000),
  headshot:
    'https://glip-prod.s3.amazonaws.com/web/customer_files/281313292/modified.jp…ccessKeyId=AKIAJROPQDFTIHBTLJJQ&Signature=RHlroxS9GZxP3%2F2Sqi1Ih49whAA%3D', // tslint:disable-line
  sanitized_rc_extension: { extensionNumber: '2013', type: 'User' },
  rc_phone_numbers: [
    { id: 536322020, phoneNumber: '16504463168', usageType: 'DirectNumber' },
    { id: 36525942, phoneNumber: '18885287464', usageType: 'MainCompanyNumber' },
  ],
  first_user: faker.random.boolean(),
};
export const personFactory = Factory.makeFactory<Person>({
  ...base,
  ...person,
});
export const rawPersonFactory = Factory.makeFactory<Raw<Person>>({
  ...rawBase,
  ...person,
});

// Profile
const profile = {
  person_id: 21701566467,
  favorite_group_ids: [2586017798, 6037741574, 66441650178],
  favorite_post_ids: [2586017798, 6037741574, 66441650178],
};
export const profileFactory = Factory.makeFactory<Profile>({
  ...base,
  ...profile,
});
export const rawProfileFactory = Factory.makeFactory<Raw<Profile>>({
  ...rawBase,
  ...profile,
});

export const storedFileFactory = Factory.makeFactory<StoredFile>({
  ...rawBase,
  storage_url: faker.internet.url(),
  download_url: faker.internet.url(),
  storage_path: faker.internet.url(),
  last_modified: uniqueNumber(),
  size: faker.random.number(10000),
});
