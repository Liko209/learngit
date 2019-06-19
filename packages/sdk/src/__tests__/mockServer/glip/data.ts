import factory from 'factory.ts';

import {
  GlipProfile,
  GlipCompany,
  GlipItem,
  GlipState,
  GlipPerson,
  GlipGroup,
  GlipPost,
  GlipClientConfig,
  InitialData,
} from './types';
import faker from 'faker';

// type DataFactory<T> = {
//   template: () => T;
//   seeds:
// }
type Templates = {
  company: GlipCompany;
  user: GlipPerson;
  people: GlipPerson[];
  groups: GlipGroup[];
  teams: GlipGroup[];
  clientConfig: GlipClientConfig;
  state: GlipState;
  profile: GlipProfile;
};
export const templates: Templates = {
  company: require('./template/company.json'),
  user: require('./template/user.json'),
  people: require('./template/people.json'),
  groups: require('./template/groups.json'),
  teams: require('./template/teams.json'),
  clientConfig: require('./template/clientConfig.json'),
  state: require('./template/state.json'),
  profile: require('./template/profile.json'),
};

// todo

export const seeds = {
  company: () => {},
  group: (groupName: string, targetUid: number): GlipGroup => {
    const card = faker.helpers.createCard();
    // const groupName = '';
    return {
      members: [templates.user._id, targetUid],
      company_id: templates.company._id,
      email_friendly_abbreviation: card.email,
      set_abbreviation: groupName,
      privacy: faker.random.arrayElement(['private', 'protected', 'public']),
      is_team: false,
      most_recent_content_modified_at: 0,
      most_recent_post_id: 0,
      most_recent_post_created_at: 0,
      post_cursor: 0,
      deactivated_post_cursor: 0,
      is_company_team: false,
    } as any;
  },
};
