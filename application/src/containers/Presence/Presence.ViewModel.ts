/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 14:41:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { Presence } from 'sdk/models';
import PresenceModel from '@/store/models/Presence';
import { PresenceProps, PresenceViewProps } from './types';

class PresenceViewModel extends StoreViewModel<PresenceProps>
  implements PresenceViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  get presence() {
    return getEntity<Presence, PresenceModel>(ENTITY_NAME.POST, this._id)
      .presence;
  }
}

export { PresenceViewModel };
