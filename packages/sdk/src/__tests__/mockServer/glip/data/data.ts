import * as Factory from 'factory.ts';
import faker from 'faker';

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
  GlipGroupState,
  GlipData,
  IFactory,
} from '../types';
import {
  companyFactory,
  userFactory,
  personFactory,
  groupFactory,
  teamFactory,
  clientConfigFactory,
  stateFactory,
  groupStateFactory,
  profileFactory,
} from './factories';
import { initialData } from 'sdk/api';
import assert from 'assert';

// interface ICompanyFactory {
//   user(): IFactory<GlipPerson>;
//   people(): IFactory<GlipPerson>;
//   group(): IFactory<GlipGroup>;
//   team(): IFactory<GlipGroup>;
//   clientConfig(): IFactory<GlipClientConfig>;
//   state(): IFactory<GlipState>;
//   profile(): IFactory<GlipProfile>;
// }

// class DataBuilder {
//   companyFactory: IFactory<GlipCompany>;
//   template: GlipData = {
//     people: [],
//     groups: [],
//     teams: [],
//   } as any;
//   companyContextFactory: CompanyContextFactory;

//   load(template: GlipData) {
//     if (template.company) {
//       this.useCompany(template.company);
//     }
//   }

//   useCompany(company: Partial<GlipCompany>) {
//     this.template.company = companyFactory.build(company);
//     this.companyContextFactory = new CompanyContextFactory(
//       this.template.company._id,
//     );
//     return this;
//   }

//   useAccount() {}

//   addGroup(group: Partial<GlipGroup>) {
//     this.template.groups.push(this.companyContextFactory.group().build(group));
//     return this;
//   }

//   addGroups(groups: GlipGroup[]) {
//     this.template.groups = this.template.groups.concat(groups);
//     return this;
//   }

//   generateGroups(count: number = 1, group?: GlipGroup) {
//     this.template.groups = this.template.groups.concat(
//       this.companyContextFactory.group().buildList(count, group),
//     );
//     return this;
//   }

//   addTeam(team: Partial<GlipGroup>) {
//     this.template.teams.push(this.companyContextFactory.team().build(team));
//     return this;
//   }

//   addTeams(teams: GlipGroup[]) {
//     this.template.teams = this.template.teams.concat(teams);
//     return this;
//   }

//   generateTeams(count: number = 1, team?: GlipGroup) {
//     this.template.teams = this.template.teams.concat(
//       this.companyContextFactory.group().buildList(count, team),
//     );
//     return this;
//   }

//   build() {
//     !this.template.company && this.useCompany({});
//     // companyContextFactory.group().build()
//   }
// }
class UserContextFactory {
  private _factoryMap: Map<string, any> = new Map();
  constructor(public id: number) {}
  private _get<T>(key: string, creator: () => T): T {
    if (!this._factoryMap.has(key)) {
      this._factoryMap.set(key, creator());
    }
    return this._factoryMap.get(key);
  }

  group(): IFactory<GlipGroup> {
    return this._get<IFactory<GlipGroup>>('group', () =>
      groupFactory.extend({ creator_id: this.id, members: [this.id] }),
    );
  }

  team(): IFactory<GlipGroup> {
    return this._get<IFactory<GlipGroup>>('team', () =>
      teamFactory.extend({
        creator_id: this.id,
        members: [this.id],
        permissions: { admin: { uids: [this.id] } },
      }),
    );
  }
}

const userContextFactory = new UserContextFactory(123);
function createGroup(targetUid: number) {
  return userContextFactory
    .group()
    .withDerivation('members', data => [data.creator_id, targetUid])
    .withDerivation(
      'set_abbreviation',
      data => `Group: ${data.creator_id} + ${targetUid}`,
    )
    .build();
}

function createTeam(teamName: string, targetUids: number[]) {
  return userContextFactory
    .group()
    .withDerivation('members', data => [data.creator_id, ...targetUids])
    .withDerivation('permissions', data => ({
      admin: { uids: [data.creator_id] },
      user: { uids: [...targetUids] },
    }))
    .build({
      set_abbreviation: teamName,
    });
}

class AccountDataFactory {
  private _factoryMap: Map<string, any> = new Map();
  constructor(public companyId: number, public userId: number) {}
  private _get<T>(key: string, creator: () => T): T {
    if (!this._factoryMap.has(key)) {
      this._factoryMap.set(key, creator());
    }
    return this._factoryMap.get(key);
  }

  // user() {}

  people() {
    return this._get<IFactory<GlipPerson>>('person', () =>
      personFactory.extend({
        company_id: this.companyId,
      }),
    );
  }

  group(): IFactory<GlipGroup> {
    return this._get<IFactory<GlipGroup>>('group', () =>
      groupFactory.extend({
        company_id: this.companyId,
        creator_id: this.userId,
        members: [this.userId],
      }),
    );
  }

  team(): IFactory<GlipGroup> {
    return this._get<IFactory<GlipGroup>>('team', () =>
      teamFactory.extend({
        is_team: true,
        company_id: this.companyId,
        creator_id: this.userId,
        members: [this.userId],
        permissions: { admin: { uids: [this.userId] } },
      }),
    );
  }
}

export const template: GlipData = {
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
      members: [template.user._id, targetUid],
      company_id: template.company._id,
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

interface IScenarioDataHelper<T> {
  factory: IFactory<T>;
}

class GroupScenarioDataHelper implements IScenarioDataHelper<GlipGroup> {
  constructor(public factory: IFactory<GlipGroup>) {}

  createGroup(targetUid: number) {
    return this.factory
      .withDerivation('members', data => [data.creator_id, targetUid])
      .withDerivation(
        'set_abbreviation',
        data => `Group: ${data.creator_id} + ${targetUid}`,
      )
      .build();
  }
}

class TeamScenarioDataHelper implements IScenarioDataHelper<GlipGroup> {
  constructor(public factory: IFactory<GlipGroup>) {}

  createTeam(teamName: string, targetUids: number[]) {
    return this.factory
      .withDerivation('members', data => [data.creator_id, ...targetUids])
      .withDerivation('permissions', data => ({
        admin: { uids: [data.creator_id] },
        user: { uids: [...targetUids] },
      }))
      .build({
        set_abbreviation: teamName,
      });
  }
}

export class GlipDataHelper {
  group: GroupScenarioDataHelper;
  team: TeamScenarioDataHelper;
  person: IFactory<GlipPerson>;
  constructor(companyId: number, userId: number) {
    const glipFactory = new AccountDataFactory(companyId, userId);
    this.group = new GroupScenarioDataHelper(glipFactory.group());
    this.team = new TeamScenarioDataHelper(glipFactory.team());
    this.person = glipFactory.people();
  }
}

class GlipController {
  setUser(user: GlipPerson) {}

  setProfile() {}

  addPost() {}
}
