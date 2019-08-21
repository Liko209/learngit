/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-20 15:23:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { MuteProps } from './types';
import { IconButtonSize } from 'jui/components/Buttons';
// import { ConversationPreferenceModel } from 'sdk/src/module/setting/entity';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';

class MuteViewModel extends AbstractViewModel<MuteProps> {
  @computed
  get size(): IconButtonSize {
    return this.props.size || 'medium';
  }

  @computed
  get isMuted() {
    // ALEX TODO: 取消下方注释
    // const { muteAll } = getEntity<
    //   ConversationPreference,
    //   ConversationPreferenceModel
    // >(ENTITY_NAME.CONVERSATION_PREFERENCE, this.props.groupId);
    // return muteAll;
    return true;
  }
}

export { MuteViewModel };
