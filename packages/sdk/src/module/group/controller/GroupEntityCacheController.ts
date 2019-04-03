/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-03-15 14:30:33
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Group } from '../entity';
import { EntityCacheController } from '../../../framework/controller/impl/EntityCacheController';
import { AccountUserConfig } from '../../../service/account/config';
import { IGroupService } from '../service/IGroupService';
class GroupEntityCacheController extends EntityCacheController<Group> {
  private _individualGroups: Map<number, Group> = new Map();

  static buildGroupEntityCacheController(groupService: IGroupService) {
    return new GroupEntityCacheController(groupService);
  }

  constructor(private _groupService: IGroupService) {
    super();
  }

  async clear(): Promise<void> {
    super.clear();
    this._individualGroups.clear();
  }

  getIndividualGroups() {
    return this._individualGroups;
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

    super.deleteInternal(key);
  }

  protected putInternal(group: Group) {
    super.putInternal(group);
    if (this._groupService.isIndividualGroup(group)) {
      const personId = this._getPersonIdInIndividualGroup(group);
      personId && this._individualGroups.set(personId, group);
    }
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
