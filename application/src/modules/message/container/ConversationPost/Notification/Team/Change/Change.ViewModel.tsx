/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { Markdown } from 'glipdown';
import { ChangeViewProps } from './types';
import { TeamViewModel } from '../Team.ViewModel';

class ChangeViewModel extends TeamViewModel implements ChangeViewProps {
  @computed
  get changerId() {
    const { changer_id: changerId } = this.activityData;
    return changerId;
  }

  @computed
  get changerName() {
    return this.getPerson(this.changerId).userDisplayName;
  }

  @computed
  get value() {
    const { value } = this.activityData;
    return Markdown(value);
  }

  @computed
  get oldValue() {
    const { old_value: oldValue } = this.activityData;
    return Markdown(oldValue);
  }
}

export { ChangeViewModel };
