/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ProfileDialogGroupContentViewProps } from './types';
import { ProfileDialogGroupViewModel } from '../Group.ViewModel';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { GlipTypeUtil } from 'sdk/utils';

class ProfileDialogGroupContentViewModel extends ProfileDialogGroupViewModel
  implements ProfileDialogGroupContentViewProps {
  @computed
  get showMessage() {
    if (!this.group || !this.group.members) {
      return false;
    }
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return this.group.members.includes(currentUserId);
  }

  @computed
  get showJoinTeam() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const { isTeam, privacy, members } = this.group;
    return Boolean(
      isTeam && privacy === 'protected' && !members.includes(currentUserId),
    );
  }

  @computed
  get destinationId() {
    const { convertedToTeam } = this.group;
    return convertedToTeam && convertedToTeam.team_id
      ? convertedToTeam.team_id
      : this.id;
  }

  @computed
  get typeId(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }

  @computed
  get analysisType() {
    return this.group.analysisType;
  }
}

export { ProfileDialogGroupContentViewModel };
