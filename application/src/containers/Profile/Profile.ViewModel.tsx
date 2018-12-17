/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { PROFILE_TYPE, ProfileProps, ProfileViewProps } from './types';
import { GlipTypeUtil } from 'sdk/utils';

class ProfileViewModel extends AbstractViewModel<ProfileProps>
  implements ProfileViewProps {
  @computed
  get id() {
    return this.props.id; // personId || conversationId
  }

  @computed
  get type(): PROFILE_TYPE {
    return this.props.type;
  }

  @computed
  get typeId(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }
}

export { ProfileViewModel };
