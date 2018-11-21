/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ProfileMiniCardProps,
  ProfileMiniCardViewProps,
  PROFILE_MODEL_TYPE,
} from './types';

class ProfileMiniCardViewModel extends AbstractViewModel<ProfileMiniCardProps>
  implements ProfileMiniCardViewProps {
  @computed
  get id() {
    // personId || conversationId
    return this.props.id;
  }

  @computed
  get type(): PROFILE_MODEL_TYPE {
    return this._getProfileModelType(this.id);
  }

  private _getProfileModelType(id: number) {
    // todo invoke service api
    return PROFILE_MODEL_TYPE.GROUP;
  }
}

export { ProfileMiniCardViewModel };
