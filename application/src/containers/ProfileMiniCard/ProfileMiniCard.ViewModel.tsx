/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProfileMiniCardProps, ProfileMiniCardViewProps } from './types';
import { GlipTypeUtil } from 'sdk/utils';

class ProfileMiniCardViewModel extends AbstractViewModel<ProfileMiniCardProps>
  implements ProfileMiniCardViewProps {
  @computed
  get id() {
    return this.props.id; // personId || conversationId
  }

  @computed
  get type(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }
}

export { ProfileMiniCardViewModel };
