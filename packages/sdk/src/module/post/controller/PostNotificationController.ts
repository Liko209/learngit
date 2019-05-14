/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-13 14:37:44
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from '../entity';
import { EntityNotificationController } from '../../../framework/controller/impl/EntityNotificationController';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { GroupService } from '../../group';
import { AccountUserConfig } from '../../account/config/AccountUserConfig';

class PostNotificationController extends EntityNotificationController<Post> {
  constructor() {
    super();
    this.setFilterFunc(this._postNotificationFilter());
  }

  private _postNotificationFilter() {
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    return (post: Post) => {
      if (post && post.creator_id !== currentUserId && post.group_id) {
        const group = groupService.getSynchronously(post.group_id);
        const groupLastPostId = (group && group.most_recent_post_id) || 0;
        return post.id > groupLastPostId;
      }
      return false;
    };
  }
}

export { PostNotificationController };
