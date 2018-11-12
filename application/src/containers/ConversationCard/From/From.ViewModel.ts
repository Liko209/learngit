/*
 * @Author: Andy Hu
 * @Date: 2018-11-12 10:45:42
 * Copyright © RingCentral. All rights reserved.
 */
/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { FromProps, FromViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';

class FromViewModel extends AbstractViewModel implements FromViewProps {
  @observable
  _id: number;

  @computed
  get displayName(): string {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id)
      .displayName;
  }
  @computed
  get isTeam(): boolean {
    return !!getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id).isTeam;
  }

  onReceiveProps({ id }: FromProps) {
    if (id !== this._id) {
      this._id = id;
    }
  }
}

export { FromViewModel };
