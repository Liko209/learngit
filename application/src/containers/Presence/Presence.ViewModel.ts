/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 14:41:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { Presence } from 'sdk/module/presence/entity';
import PresenceModel from '@/store/models/Presence';
import { PresenceProps, PresenceViewProps } from './types';
import { PRESENCE } from 'sdk/module/presence/constant';

class PresenceViewModel extends StoreViewModel<PresenceProps>
  implements PresenceViewProps {
  @computed
  get size() {
    return this.props.size;
  }
  @computed
  get borderSize() {
    return this.props.borderSize;
  }
  @computed
  get presence() {
    if (this.props.uid !== 0) {
      const person = getEntity(ENTITY_NAME.PERSON, this.props.uid);
      if (person.deactivated) {
        return PRESENCE.NOTREADY;
      }
      return (
        getEntity<Presence, PresenceModel>(ENTITY_NAME.PRESENCE, this.props.uid)
          .presence || PRESENCE.NOTREADY
      );
    }
    return PRESENCE.NOTREADY;
  }
}

export { PresenceViewModel };
