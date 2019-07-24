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
  get presence() {
    const { presence = PRESENCE.NOTREADY } = getEntity<Presence, PresenceModel>(
      ENTITY_NAME.PRESENCE,
      this.props.uid
    );
    return presence;
  }
}

export { PresenceViewModel };
