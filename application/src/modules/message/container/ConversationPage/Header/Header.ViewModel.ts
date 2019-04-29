/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:23:20
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed, action } from 'mobx';
import { Group } from 'sdk/module/group/entity';
import { Person } from 'sdk/module/person/entity';
import { getEntity, getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import { ENTITY_NAME } from '@/store';
import { AbstractViewModel } from '@/base';
import { CONVERSATION_TYPES } from '@/constants';
import i18next from 'i18next';
import _ from 'lodash';

class HeaderViewModel extends AbstractViewModel {
  @observable
  private _id: number;

  @action
  onReceiveProps({ id }: { id: number }) {
    this._id = id;
  }

  @computed
  get groupId() {
    return this._id;
  }

  @computed
  get title() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    let title = group.displayName;
    if (group.type === CONVERSATION_TYPES.SMS) {
      title += ` (${i18next.t('message.messageTypeNameSMS')})`;
    }
    return title;
  }

  @computed
  get analysisSource() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.analysisType;
  }

  @computed
  get customStatus() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    if (group.isTeam) {
      return null;
    }
    if (group.members && group.members.length <= 2) {
      let userId;
      if (group.members.length === 1) {
        userId = group.members[0];
      } else {
        userId = _.difference(
          group.members,
          [].concat(getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID)),
        )[0];
      }
      const user = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, userId);
      return user.awayStatus || null;
    }
    return null;
  }

  @computed
  get type() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.type;
  }

  @computed
  get isFavorite() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group.isFavorite;
  }
}

export { HeaderViewModel };
