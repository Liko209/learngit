/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AddedViewProps } from './types';
import { TeamViewModel } from '../Team.ViewModel';

class AddedViewModel extends TeamViewModel implements AddedViewProps {
  @computed
  get inviterId() {
    const { inviter_id: inviterId } = this.activityData;
    return inviterId;
  }

  @computed
  get inviterName() {
    return super.getPerson(this.inviterId).userDisplayName;
  }

  @computed
  get newUserId() {
    const { new_user_id: newUserId } = this.activityData;
    return newUserId;
  }

  @computed
  get newUserName() {
    return this.getPerson(this.newUserId).userDisplayName;
  }
}

export { AddedViewModel };
