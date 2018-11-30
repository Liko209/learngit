/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { JoinViewProps } from './types';
import { TeamViewModel } from '../Team.ViewModel';

class JoinViewModel extends TeamViewModel implements JoinViewProps {
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

export { JoinViewModel };
