/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import moment from 'moment';
import { AbstractViewModel } from '@/base';
import { ChangeProps, ChangeViewProps } from './types';
import { Markdown } from 'glipdown';

import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import PostModel from '@/store/models/Post';
import { Person, Post } from 'sdk/models';

class ChangeViewModel extends AbstractViewModel<ChangeProps>
  implements ChangeViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  private get _activityData() {
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
  get changerId() {
    const { changer_id: changerId } = this._activityData;
    return changerId;
  }

  @computed
  get changerName() {
    return this._getPerson(this.changerId).displayName;
  }

  @computed
  get value() {
    const { value } = this._activityData;
    return Markdown(value);
  }

  @computed
  get oldValue() {
    const { old_value: oldValue } = this._activityData;
    return Markdown(oldValue);
  }
}

export { ChangeViewModel };
