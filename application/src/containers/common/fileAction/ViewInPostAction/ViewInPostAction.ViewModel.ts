/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:42
 * Copyright © RingCentral. All rights reserved.
 */

import { jumpToPost } from '@/common/jumpToPost';
import portalManager from '@/common/PortalManager';
import { catchError } from '@/common/catchError';
import { FileActionViewModel } from '../common/FIleAction.ViewModel';
import { ViewInPostActionProps } from './types';

class ViewInPostActionViewModel extends FileActionViewModel<
  ViewInPostActionProps
> {
  @catchError.flash({
    network: 'message.prompt.viewInPostFailedWithNetworkIssue',
    server: 'message.prompt.viewInPostFailedWithServerIssue',
  })
  viewInPost = async () => {
    const { groupId, asyncOperationDecorator } = this.props;
    let post;
    if (asyncOperationDecorator) {
      post = await asyncOperationDecorator(() =>
        this.item.getDirectRelatedPostInGroup(groupId),
      )();
    } else {
      post = await this.item.getDirectRelatedPostInGroup(groupId);
    }

    if (post) {
      portalManager.dismissAll();
      jumpToPost({ groupId, id: post.id });
    }
  }
}

export { ViewInPostActionViewModel };
