/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { NotificationProps, NotificationViewProps } from './types';
import { getEntity } from '@/store/utils';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

class NotificationViewModel extends AbstractViewModel<NotificationProps>
  implements NotificationViewProps {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get content() {
    // todo
    return 'John Smith changed the thread subject from ”Test” to ”Global UXD”';
  }

  @computed
  get date() {
    // todo
    return 'Sep 4th 2018 3:15 PM';
  }
}

export { NotificationViewModel };
