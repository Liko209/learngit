/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../controller/PostController';
import { Post } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { daoManager, PostDao } from '../../../dao';
import { Api } from '../../../api';

class PostService extends EntityBaseService<Post> {
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
}

export { PostService };
