/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { PrivacyProps, PrivacyViewProps } from './types';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

class PrivacyViewModel extends AbstractViewModel<PrivacyProps>
  implements PrivacyViewProps {
  @computed
  get id() {
    return this.props.id; // personId || conversationId
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get isPublic() {
    return this._group.isTeam ? this._group.privacy !== 'private' : true;
  }
}

export { PrivacyViewModel };
