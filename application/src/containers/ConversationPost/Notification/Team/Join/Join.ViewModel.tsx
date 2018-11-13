/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import moment from 'moment';
import { AbstractViewModel } from '@/base';
import { JoinProps, JoinViewProps } from './types';

import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import PostModel from '@/store/models/Post';
import { Person, Post } from 'sdk/models';

class JoinViewModel extends AbstractViewModel<JoinProps>
  implements JoinViewProps {
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
    return this._post.activityData;
  }

  @computed
  get createdAt() {
    return moment(this._post.createdAt).format('lll');
  }

  private _getPerson(id: number) {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
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

export { JoinViewModel };
