/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { AddedProps, AddedViewProps } from './types';

import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import PostModel from '@/store/models/Post';
import { Person, Post } from 'sdk/models';

class AddedViewModel extends AbstractViewModel<AddedProps>
  implements AddedViewProps {
  @computed
  get _id() {
    return this.props.id;
  }

  @computed
  get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get _activityData() {
    return this._post.activityData || {};
  }

  @computed
  get createdAt() {
    // todo format
    return this._post.createdAt.toString();
  }

  private _getPerson(id: number) {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }

  @computed
  get inviterId() {
    const { inviter_id: inviterId } = this._activityData;
    return inviterId;
  }

  @computed
  get inviterName() {
    return this._getPerson(this.inviterId).displayName;
  }

  @computed
  get newUserId() {
    const { new_user_id: newUserId } = this._activityData;
    return newUserId;
  }

  @computed
  get newUserName() {
    return this._getPerson(this.newUserId).displayName;
  }
}

export { AddedViewModel };
