/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ProfileDialogGroupContentViewProps } from './types';
import { ProfileDialogGroupViewModel } from '../ProfileDialogGroup.ViewModel';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

class ProfileDialogGroupContentViewModel extends ProfileDialogGroupViewModel
  implements ProfileDialogGroupContentViewProps {
  @computed
  get showMessage() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return this.group.members.includes(currentUserId);
  }
}

export { ProfileDialogGroupContentViewModel };
