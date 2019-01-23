/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../controller/PostController';
import { Post, IPostQuery, IPostResult } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { daoManager, PostDao, QUERY_DIRECTION } from '../../../dao';
import { Api } from '../../../api';
import { SendPostType, EditPostType } from '../types';

class NewPostService extends EntityBaseService<Post> {
  static serviceName = 'NewPostService';
  postController: PostController;
  constructor() {
    super(false, daoManager.getDao(PostDao), {
      basePath: '/item',
      networkClient: Api.glipNetworkClient,
    });
  }

  protected getPostController() {
    if (!this.postController) {
      this.postController = new PostController();
    }
    return this.postController;
  }

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    return this.getPostController()
      .getPostActionController()
      .likePost(postId, personId, toLike);
  }

  async deletePost(id: number) {
    return this.getPostController()
      .getPostActionController()
      .deletePost(id);
  }

  async editPost(params: EditPostType) {
    return this.getPostController()
      .getPostActionController()
      .editPost(params);
  }

  async sendPost(params: SendPostType) {
    return this.getPostController()
      .getSendPostController()
      .sendPost(params);
  }

  async reSendPost(postId: number) {
    return this.getPostController()
      .getSendPostController()
      .reSendPost(postId);
  }

  async getPostsByGroupId({
    groupId,
    postId = 0,
    limit = 20,
    direction = QUERY_DIRECTION.OLDER,
  }: IPostQuery): Promise<IPostResult> {
    return this.getPostController()
      .getPostFetchController()
      .getPostsByGroupId({ groupId, postId, limit, direction });
  }
}

export { NewPostService };
