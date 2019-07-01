/*
 * @Author: wayne.zhou
 * @Date: 2019-05-27 17:47:42
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ViewInPostActionProps } from './types';
import { StoreViewModel } from '@/store/ViewModel';
import { PostService } from 'sdk/module/post';
import { jumpToPost } from '@/common/jumpToPost';
import portalManager from '@/common/PortalManager';
import { catchError } from '@/common/catchError';

class ViewInPostActionViewModel extends StoreViewModel<ViewInPostActionProps> {
  @catchError.flash({
    network: 'message.prompt.viewInPostFailedWithNetworkIssue',
    server: 'message.prompt.viewInPostFailedWithServerIssue',
  })
  viewInPost = async () => {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    const { groupId, fileId, asyncOperationDecorator } = this.props;
    let postId;
    if (asyncOperationDecorator) {
      postId = await asyncOperationDecorator(() =>
        postService.getLatestPostIdByItem(groupId, fileId),
      );
    } else {
      postId = await postService.getLatestPostIdByItem(groupId, fileId);
    }

    if (postId) {
      portalManager.dismissAll();
      jumpToPost({ groupId, id: postId });
    }
  }
}

export { ViewInPostActionViewModel };
