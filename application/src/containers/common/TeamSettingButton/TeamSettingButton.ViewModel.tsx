/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-16 09:24:41
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { TeamSettingButtonProps, TeamSettingButtonViewProps } from './types';
import { IconButtonSize } from 'jui/components/Buttons';

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
}

export { TeamSettingButtonViewModel };
