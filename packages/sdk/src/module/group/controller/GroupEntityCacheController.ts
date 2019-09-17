/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 14:30:33
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../entity';
import { EntityCacheController } from '../../../framework/controller/impl/EntityCacheController';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { IGroupService } from '../service/IGroupService';
import { SearchUtils } from '../../../framework/utils/SearchUtils';

const soundex = require('soundex-code');

class GroupEntityCacheController extends EntityCacheController<Group> {
  private _individualGroups: Map<number, Group> = new Map();
  private _soundexValue: Map<number, string[]> = new Map();
  private _teamIdsIncludeMe: Set<number> = new Set();

  static buildGroupEntityCacheController(groupService: IGroupService) {
    return new GroupEntityCacheController(groupService);
  }

  constructor(private _groupService: IGroupService) {
    super();
  }

  async clear(): Promise<void> {
    super.clear();
    this._individualGroups.clear();
    this._soundexValue.clear();
  }

  getIndividualGroups() {
    return this._individualGroups;
  }

  getTeamIdsIncludeMe() {
    return this._teamIdsIncludeMe;
  }

  public getSoundexById(id: number): string[] {
    return this._soundexValue.get(id) || [];
  }

  protected deleteInternal(key: number) {
    const group = this._entities.get(key);
    const personId =
      group && this._groupService.isIndividualGroup(group)
        ? this._getPersonIdInIndividualGroup(group)
        : undefined;
    if (personId && this._individualGroups.has(personId)) {
      this._individualGroups.delete(personId);
    }
    if (this._soundexValue.has(key)) {
      this._soundexValue.delete(key);
    }

    this._teamIdsIncludeMe.delete(key);
    super.deleteInternal(key);
  }

  private _getCurrentUserId() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getGlipUserId();
  }

  private _isCurrentUserInTeam(group: Group) {
    return (
      group && group.is_team && group.members.includes(this._getCurrentUserId())
    );
  }

  protected putInternal(group: Group) {
    if (this._groupService.isSMSGroup(group)) {
      return;
    }

    super.putInternal(group);
    if (this._groupService.isIndividualGroup(group)) {
      const personId = this._getPersonIdInIndividualGroup(group);
      personId && this._individualGroups.set(personId, group);
    }
    if (this._isCurrentUserInTeam(group)) {
      this._teamIdsIncludeMe.add(group.id);
    }

    this._setSoundexValue(group);
  }

  protected updatePartial(oldEntity: Group, partialEntity: Partial<Group>) {
    super.updatePartial(oldEntity, partialEntity);
    this._setSoundexValue(oldEntity);
  }

  private _setSoundexValue(group: Group) {
    let soundexResult: string[] = [];
    if (this._groupService.isValid(group) && group.set_abbreviation) {
      const terms = SearchUtils.getTermsFromText(group.set_abbreviation);
      soundexResult = terms.map((term: string) => soundex(term));
    }
    this._soundexValue.set(group.id, soundexResult);
  }

  private _getPersonIdInIndividualGroup(group: Group) {
    const currentUserId = this._getCurrentUserId();
    for (const memberId of group.members) {
      if (memberId !== currentUserId) {
        return memberId;
      }
    }
    return undefined;
  }
}

export { GroupEntityCacheController };
