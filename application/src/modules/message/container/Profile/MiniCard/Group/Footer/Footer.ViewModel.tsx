/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ProfileMiniCardGroupFooterViewProps } from './types';
import { ProfileMiniCardGroupViewModel } from '../Group.ViewModel';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

class ProfileMiniCardGroupFooterViewModel extends ProfileMiniCardGroupViewModel
  implements ProfileMiniCardGroupFooterViewProps {
  @computed
  get showMessage() {
    if (!this.group || !this.group.members) {
      return false;
    }
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return this.group.members.includes(currentUserId);
  }

  @computed
  get analysisType() {
    return this.group.analysisType;
  }
}

export { ProfileMiniCardGroupFooterViewModel };
