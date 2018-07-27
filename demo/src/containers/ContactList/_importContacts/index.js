import { dao } from 'sdk';
import faker from 'faker';
const { daoManager, PersonDao } = dao;
const personDao = daoManager.getDao(PersonDao);

function generatePersons(count = 10) {
  console.time(`generatePersons(${count})`);

  faker.seed(1);

  const persons = _.range(0, count).map(i => {
    return {
      creator_id: faker.random.number(),
      created_at: faker.date.past().getTime(),
      version: 1,
      deactivated: false,
      email: faker.internet.email(),
      first_name: faker.name.findName(),
      last_name: faker.name.lastName(),
      company_id: 5062657,
      has_registered: false,
      display_name: faker.name.findName(),
      is_webmail: false,
      externally_registered: 'rc_signons',
      has_rc_access_token: false,
      has_bogus_email: false,
      rc_extension_id: 2888957004,
      model_size: 3,
      id: i + 1
    };
  });
  console.timeEnd(`generatePersons(${count})`);
  return persons;
}

export default async function (count) {
  console.log('importing contacts');
  const persons = generatePersons(count);
  console.log('contacts data ready');
  await personDao.clear();
  await personDao.bulkPut(persons);
  alert(`${count} contacts inserted.\n The page will reload now.`);
  location.href = '/contact/list';
}
