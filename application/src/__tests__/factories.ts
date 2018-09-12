import Factory from 'factory.ts';
import faker from 'faker';
import PersonModel from '../store/models/Person';
import GroupModel from '../store/models/Group';

const uniqueNumber = () =>
  Factory.each(i => faker.random.number(Date.now() + i));

const base = {
  id: uniqueNumber(),
  toJS: () => {},
};

// PersonModel
const personModelFactory = Factory.makeFactory<PersonModel>({
  ...base,
  companyId: uniqueNumber(),
  email: faker.internet.email(),
  firstName: faker.name.findName(),
  lastName: faker.name.findName(),
  displayName: '',
});

personModelFactory.withDerivation(
  'displayName',
  ({ firstName, lastName }) => `${firstName} ${lastName}`,
);

// GroupModel
const groupModelFactory = Factory.makeFactory<GroupModel>({
  ...base,
  setAbbreviation: faker.company.companyName(),
  members: [faker.random.number(100000000)],
});

export { personModelFactory, groupModelFactory };
