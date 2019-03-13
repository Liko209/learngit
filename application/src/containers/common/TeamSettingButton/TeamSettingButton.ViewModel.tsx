/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:41
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { TeamSettingButtonProps, TeamSettingButtonViewProps } from './types';
import { IconButtonSize } from 'jui/components/Buttons';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';

class TeamSettingButtonViewModel
  extends AbstractViewModel<TeamSettingButtonProps>
  implements TeamSettingButtonViewProps {
  @computed
  get id() {
    return this.props.id; // teamId
  }

  @computed
  get size(): IconButtonSize {
    return this.props.size || 'small';
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }
}

export { TeamSettingButtonViewModel };
