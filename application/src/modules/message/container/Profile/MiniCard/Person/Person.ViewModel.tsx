/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ProfileMiniCardPersonProps,
  ProfileMiniCardPersonViewProps,
} from './types';
import { getEntity, getGlobalValue } from '@/store/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { getColonsEmoji, getStatusPlainText } from '@/common/getSharedStatus';

class ProfileMiniCardPersonViewModel
  extends AbstractViewModel<ProfileMiniCardPersonProps>
  implements ProfileMiniCardPersonViewProps {
  @computed
  get id() {
    return this.props.id; // person id
  }

  @computed
  get person() {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.id);
  }

  @computed
  get isMe(): boolean {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return this.id === currentUserId;
  }
  @computed
  get colonsEmoji() {
    const status = this.person.awayStatus || '';
    return getColonsEmoji(status);
  }
  @computed
  get statusPlainText() {
    const status = this.person.awayStatus || '';

    return getStatusPlainText(status);
  }
}

export { ProfileMiniCardPersonViewModel };
