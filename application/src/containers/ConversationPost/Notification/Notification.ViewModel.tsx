/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { NotificationProps, NotificationViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';

class NotificationViewModel extends AbstractViewModel<NotificationProps>
  implements NotificationViewProps {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get activityData() {
    return this._post.activityData || {};
  }
}

export { NotificationViewModel };
