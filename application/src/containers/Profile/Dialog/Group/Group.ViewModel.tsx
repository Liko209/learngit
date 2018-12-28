/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProfileDialogGroupProps, ProfileDialogGroupViewProps } from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

class ProfileDialogGroupViewModel
  extends AbstractViewModel<ProfileDialogGroupProps>
  implements ProfileDialogGroupViewProps {
  @computed
  get id() {
    return this.props.id; // conversation id
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }
}

export { ProfileDialogGroupViewModel };
