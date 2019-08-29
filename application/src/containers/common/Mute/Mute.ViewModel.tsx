/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-20 15:23:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { MuteProps } from './types';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { ConversationPreference } from 'sdk/module/profile/entity/Profile';
import ConversationPreferenceModel from '@/store/models/ConversationPreference';

class MuteViewModel extends AbstractViewModel<MuteProps> {
  @computed
  get isMuted() {
    const { muted } = getEntity<
      ConversationPreference,
      ConversationPreferenceModel
    >(ENTITY_NAME.CONVERSATION_PREFERENCE, this.props.groupId);
    return muted;
  }
}

export { MuteViewModel };
