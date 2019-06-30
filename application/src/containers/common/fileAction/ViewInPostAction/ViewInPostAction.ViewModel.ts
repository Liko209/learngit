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

class ViewInPostActionViewModel extends StoreViewModel<ViewInPostActionProps> {
  viewInPost = async () => {
    const postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    const { groupId, fileId } = this.props;
    // MTODO: cache error
    const postId = await postService.getLatestPostIdByItem(groupId, fileId);

    if (postId) {
      portalManager.dismissAll();
      jumpToPost({ groupId, id: postId });
    }
  }
}

export { ViewInPostActionViewModel };
