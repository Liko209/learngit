/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 14:41:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getPresence } from '@/store/utils';
import { PresenceProps, PresenceViewProps } from './types';

class PresenceViewModel extends StoreViewModel<PresenceProps> implements PresenceViewProps {
  @computed
  get presence() {
    return getPresence(this.props.uid);
  }
}

export { PresenceViewModel };
