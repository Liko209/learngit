import Factory from 'factory.ts';
import faker from 'faker';
import PersonModel from '../store/models/Person';
import GroupModel from '../store/models/Group';

const uniqueNumber = () => Factory.each(i => faker.random.number(Date.now() + i));

const base = {
  id: uniqueNumber(),
  toJS: () => { },
  dispose: () => { },
};

// PersonModel
const personModelFactory = Factory.makeFactory<PersonModel>({
  ...base,
  companyId: uniqueNumber(),
  email: faker.internet.email(),
  firstName: faker.name.findName(),
  lastName: faker.name.lastName(),
  displayName: '',
  update: () => { },
});

personModelFactory.withDerivation('displayName', ({ firstName, lastName }) => `${firstName} ${lastName}`);

// GroupModel
const groupModelFactory = Factory.makeFactory<GroupModel>({
  ...base,
  setAbbreviation: faker.company.companyName(),
  members: [faker.random.number(100000000)],
});

// company_id: faker.random.number(100000000),
//   email_friendly_abbreviation: 'Me',
//   set_abbreviation: 'Me',
//   privacy: faker.random.arrayElement(['private', 'protected', 'public']),
//   is_team: faker.random.boolean(),
//   most_recent_content_modified_at: uniqueNumber(),
//   most_recent_post_id: uniqueNumber(),
//   most_recent_post_created_at: uniqueNumber(),
//   post_cursor: faker.random.number(1000),
//   deactivated_post_cursor: faker.random.number(1000),

export {
  personModelFactory,
  groupModelFactory,
};
