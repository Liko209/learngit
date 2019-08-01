/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:20:02
 * Copyright © RingCentral. All rights reserved.
 */
import { IFactory, IScenarioDataHelper } from 'shield/sdk/types';
import {
  GlipGroup,
  GlipGroupState,
  GlipPerson,
  GlipPost,
  GlipProfile,
  GlipState,
  InitialData,
  GlipBase,
} from '../types';
import {
  groupFactory,
  groupStateFactory,
  personFactory,
  postFactory,
  profileFactory,
  stateFactory,
  teamFactory,
} from './factories';
import { UndefinedAble } from 'sdk/types';
import { createDebug } from 'sdk/__tests__/utils';
import _ from 'lodash';

const debug = createDebug('DataHelper');

class AccountDataFactory {
  private _factoryMap: Map<string, any> = new Map();
  constructor(public companyId: number, public userId: number) {}
  private _get<T>(key: string, creator: () => T): T {
    if (!this._factoryMap.has(key)) {
      this._factoryMap.set(key, creator());
    }
    return this._factoryMap.get(key);
  }

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

  post(): IFactory<GlipPost> {
    return this._get<IFactory<GlipPost>>('post', () =>
      postFactory.extend({
        company_id: this.companyId,
        creator_id: this.userId,
      }),
    );
  }

  groupState(): IFactory<GlipGroupState> {
    return this._get<IFactory<GlipGroupState>>('GlipGroupState', () =>
      groupStateFactory.extend({
        creator_id: this.userId,
      }),
    );
  }

  profile(): IFactory<GlipProfile> {
    return this._get<IFactory<GlipProfile>>('GlipProfile', () =>
      profileFactory.extend({
        person_id: this.userId,
        creator_id: this.userId,
      }),
    );
  }

  state(): IFactory<GlipState> {
    return this._get<IFactory<GlipState>>('GlipState', () =>
      stateFactory.extend({
        creator_id: this.userId,
        person_id: this.userId,
      }),
    );
  }
}

class GroupScenarioDataHelper implements IScenarioDataHelper<GlipGroup> {
  constructor(public factory: IFactory<GlipGroup>) {}

  createGroup(targetUid: number, partial?: Partial<GlipGroup>) {
    return this.factory
      .withDerivation('members', data => [data.creator_id, targetUid])
      .withDerivation(
        'set_abbreviation',
        data => `Group: ${data.creator_id} + ${targetUid}`,
      )
      .build(partial);
  }
}

class TeamScenarioDataHelper implements IScenarioDataHelper<GlipGroup> {
  constructor(public factory: IFactory<GlipGroup>) {}

  createTeam(
    teamName: string,
    targetUids: number[],
    partial?: Partial<GlipGroup>,
  ) {
    return this.factory
      .withDerivation('members', data => [data.creator_id, ...targetUids])
      .withDerivation('permissions', data => ({
        admin: { uids: [data.creator_id] },
        user: { uids: [...targetUids] },
      }))
      .build({
        set_abbreviation: teamName,
        ...partial,
      });
  }
}

class PostScenarioDataHelper implements IScenarioDataHelper<GlipPost> {
  constructor(public factory: IFactory<GlipPost>) {}

  createPost(groupId: number, text: string, partial?: Partial<GlipPost>) {
    return this.factory.build({
      text,
      group_id: groupId,
      ...partial,
    });
  }
}

class ProfileScenarioDataHelper implements IScenarioDataHelper<GlipProfile> {
  constructor(public factory: IFactory<GlipProfile>) {}
}

class StateScenarioDataHelper implements IScenarioDataHelper<GlipState> {
  constructor(public factory: IFactory<GlipState>) {}
}

class GroupStateScenarioDataHelper
  implements IScenarioDataHelper<GlipGroupState> {
  constructor(public factory: IFactory<GlipGroupState>) {}

  createGroupState(groupId: number, partial?: Partial<GlipGroupState>) {
    return this.factory.build({
      _id: groupId,
      group_id: groupId,
      ...partial,
    });
  }
}

interface ICollection<T> {
  find(obj: T): UndefinedAble<T>;
  replace(obj: T): void;
  put(obj: T): void;
}

class ObjectCollection<T extends GlipBase> implements ICollection<T> {
  constructor(public collection: T, public setter: (obj: T) => void) {}

  find(obj: GlipBase): UndefinedAble<T> {
    return obj._id === this.collection._id ? this.collection : undefined;
  }

  replace(obj: T): void {
    this.setter(obj);
  }

  put(obj: T): void {
    this.setter(obj);
  }
}

class ArrayCollection<T extends GlipBase> implements ICollection<T> {
  constructor(public collection: T[]) {}

  find(obj: T): UndefinedAble<T> {
    return _.find(this.collection, it => it._id === obj._id);
  }

  replace(obj: T): void {
    const index = _.findIndex(this.collection, it => it._id === obj._id);
    this.collection[index] = obj;
  }

  put(obj: T): void {
    this.collection.push(obj);
  }
}

class DataOperator<T> {
  constructor(public collection: ICollection<T>) {}

  insertOrUpdate(obj: T) {
    const target = this.collection.find(obj);
    if (target) {
      debug('replace Entity: ', target, ' with:', obj);
      this.collection.replace(obj);
    } else {
      this.collection.put(obj);
    }
  }
}

export class GlipDataHelper {
  group: GroupScenarioDataHelper;
  team: TeamScenarioDataHelper;
  person: IFactory<GlipPerson>;
  post: PostScenarioDataHelper;
  profile: ProfileScenarioDataHelper;
  state: StateScenarioDataHelper;
  groupState: GroupStateScenarioDataHelper;
  constructor(companyId: number, userId: number) {
    const glipFactory = new AccountDataFactory(companyId, userId);
    this.group = new GroupScenarioDataHelper(glipFactory.group());
    this.team = new TeamScenarioDataHelper(glipFactory.team());
    this.person = glipFactory.people();
    this.post = new PostScenarioDataHelper(glipFactory.post());
    this.profile = new ProfileScenarioDataHelper(glipFactory.profile());
    this.state = new StateScenarioDataHelper(glipFactory.state());
    this.groupState = new GroupStateScenarioDataHelper(
      glipFactory.groupState(),
    );
  }
}

export const createInitialDataHelper = (initialData: InitialData) => {
  return {
    profile: new DataOperator(
      new ObjectCollection(initialData.profile, value => {
        initialData.profile = value;
      }),
    ),
    companies: new DataOperator(new ArrayCollection(initialData.companies)),
    items: new DataOperator(new ArrayCollection(initialData.items)),
    state: new DataOperator(
      new ObjectCollection(initialData.state, value => {
        initialData.state = value;
      }),
    ),
    people: new DataOperator(new ArrayCollection(initialData.people)),
    publicTeams: new DataOperator(
      new ArrayCollection(initialData.public_teams),
    ),
    groups: new DataOperator(new ArrayCollection(initialData.groups)),
    teams: new DataOperator(new ArrayCollection(initialData.teams)),
    posts: new DataOperator(new ArrayCollection(initialData.posts)),
    clientConfig: new DataOperator(
      new ObjectCollection(initialData.client_config, value => {
        initialData.client_config = value;
      }),
    ),
  };
};

export type GlipInitialDataHelper = ReturnType<typeof createInitialDataHelper>
