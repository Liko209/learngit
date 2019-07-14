/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:20:02
 * Copyright © RingCentral. All rights reserved.
 */
import {
  GlipGroup,
  GlipGroupState,
  GlipPerson,
  GlipPost,
  GlipProfile,
  GlipState,
} from '../types';
import {
  groupFactory,
  groupStateFactory,
  personFactory,
  postFactory,
  profileFactory,
  stateFactory,
  teamFactory,
  userFactory,
} from './factories';
import { IScenarioDataHelper, IFactory } from 'shield/sdk/types';

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
    return this._get<IFactory<GlipPerson>>('person', () => personFactory.extend({
        company_id: this.companyId,
      }),);
  }

  group(): IFactory<GlipGroup> {
    return this._get<IFactory<GlipGroup>>('group', () => groupFactory.extend({
        company_id: this.companyId,
        creator_id: this.userId,
        members: [this.userId],
      }),);
  }

  team(): IFactory<GlipGroup> {
    return this._get<IFactory<GlipGroup>>('team', () => teamFactory.extend({
        is_team: true,
        company_id: this.companyId,
        creator_id: this.userId,
        members: [this.userId],
        permissions: { admin: { uids: [this.userId] } },
      }),);
  }

  post(): IFactory<GlipPost> {
    return this._get<IFactory<GlipPost>>('post', () => postFactory.extend({
        company_id: this.companyId,
        creator_id: this.userId,
      }),);
  }

  groupState(): IFactory<GlipGroupState> {
    return this._get<IFactory<GlipGroupState>>('GlipGroupState', () => groupStateFactory.extend({
        creator_id: this.userId,
      }),);
  }

  profile(): IFactory<GlipProfile> {
    return this._get<IFactory<GlipProfile>>('GlipProfile', () => profileFactory.extend({
        person_id: this.userId,
        creator_id: this.userId,
      }),);
  }

  state(): IFactory<GlipState> {
    return this._get<IFactory<GlipState>>('GlipState', () => stateFactory.extend({
        creator_id: this.userId,
        person_id: this.userId,
      }),);
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
