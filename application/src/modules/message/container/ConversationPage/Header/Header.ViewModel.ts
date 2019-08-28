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
import { i18nP } from '@/utils/i18nT';
import { getColonsEmoji, getStatusPlainText } from '@/common/getSharedStatus';
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
  get group() {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._id);
    return group;
  }

  @computed
  get title() {
    const group = this.group;
    if (group.type === CONVERSATION_TYPES.SMS) {
      return `${group.displayName} (${i18nP('message.messageTypeNameSMS')})`;
    }
    return group.displayName;
  }

  @computed
  get analysisSource() {
    const group = this.group;
    return group.analysisType;
  }

  @computed
  get customStatus() {
    const group = this.group;
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
    const group = this.group;
    return group.type;
  }

  @computed
  get isFavorite() {
    const group = this.group;
    return group.isFavorite;
  }
  @computed
  get colonsEmoji() {
    const status = this.customStatus || '';
    return getColonsEmoji(status);
  }
  @computed
  get statusPlainText() {
    const status = this.customStatus || '';

    return getStatusPlainText(status);
  }
}

export { HeaderViewModel };
