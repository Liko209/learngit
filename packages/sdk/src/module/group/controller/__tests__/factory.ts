import Factory from 'factory.ts';
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
