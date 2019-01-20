/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 16:12:13
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { SaveParams } from './types';

class TeamSettingsViewModel extends StoreViewModel<{ id: number }> {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get initialData() {
    return {
      name: this._group.displayName,
      description: this._group.description,
    };
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get isAdmin() {
    return this._group.isAdmin;
  }

  save = (params: SaveParams) => {};

  leaveTeam = () => {};
}

export { TeamSettingsViewModel };
