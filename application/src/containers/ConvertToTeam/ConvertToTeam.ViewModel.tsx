/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:53:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ConvertToTeamProps, ConvertToTeamViewProps } from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';

class ConvertToTeamViewModel extends AbstractViewModel<ConvertToTeamProps>
  implements ConvertToTeamViewProps {
  @observable
  saving: boolean = false;

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }
}

export { ConvertToTeamViewModel };
