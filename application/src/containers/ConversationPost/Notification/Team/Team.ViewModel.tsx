/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import moment from 'moment';
import { AbstractViewModel } from '@/base';
import { TeamProps, TeamViewProps } from './types';

import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import PostModel from '@/store/models/Post';
import { Person } from 'sdk/module/person/entity';
import { Post } from 'sdk/module/post/entity';

class TeamViewModel extends AbstractViewModel<TeamProps>
  implements TeamViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this._id);
  }

  @computed
  get activityData() {
    return this._post.activityData || {};
  }

  @computed
  get createdAt() {
    return moment(this._post.createdAt).format('lll');
  }

  getPerson(id: number) {
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, id);
  }
}

export { TeamViewModel };
