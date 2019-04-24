/*
 * @Author: Andy Hu
 * @Date: 2018-11-12 10:45:42
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { FromProps, FromViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';

class FromViewModel extends AbstractViewModel implements FromViewProps {
  @observable
  id: number;

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get displayName(): string {
    return this._group.displayName;
  }
  @computed
  get isTeam(): boolean {
    return !!this._group.isTeam;
  }

  onReceiveProps({ id }: FromProps) {
    if (id !== this.id) {
      this.id = id;
    }
  }
}

export { FromViewModel };
