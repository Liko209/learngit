/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 14:30:33
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Group } from '../entity';
import { EntityCacheController } from '../../../framework/controller/impl/EntityCacheController';
import { AccountUserConfig } from '../../../module/account/config';
import { IGroupService } from '../service/IGroupService';
import { SearchUtils } from '../../../framework/utils/SearchUtils';
const soundex = require('soundex-code');
class GroupEntityCacheController extends EntityCacheController<Group> {
  private _individualGroups: Map<number, Group> = new Map();
  private _soundexValue: Map<number, string[]> = new Map();

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
    super.deleteInternal(key);
  }

  protected putInternal(group: Group) {
    super.putInternal(group);
    if (this._groupService.isIndividualGroup(group)) {
      const personId = this._getPersonIdInIndividualGroup(group);
      personId && this._individualGroups.set(personId, group);
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
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();

    for (const memberId of group.members) {
      if (memberId !== currentUserId) {
        return memberId;
      }
    }
    return undefined;
  }
}

export { GroupEntityCacheController };
