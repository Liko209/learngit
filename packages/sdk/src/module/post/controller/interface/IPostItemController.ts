/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-15 13:37:51
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../../entity/Post';
import { PostItemData } from '../../entity/PostItemData';
import { PostItemsReadyCallback } from '../../types';
interface IPostItemController {
  buildItemVersionMap(
    groupId: number,
    itemIds: number[],
  ): Promise<PostItemData | undefined>;

  waiting4ItemsReady(
    post: Post,
    isResend: boolean,
    callback: PostItemsReadyCallback,
  ): void;
}

export { IPostItemController };
