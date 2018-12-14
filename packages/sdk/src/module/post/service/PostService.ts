/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-14-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../controller/PostController';
import PostDao from '../../../dao/post';
import { Post } from '../../../models';

class PostService {
  postController: PostController;
  constructor() {}

  protected getPostController() {
    if (!this.postController) {
      this.postController = new PostController(PostDao);
    }
    return this.postController;
  }

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    return this.getPostController().likePost(postId, personId, toLike);
  }
}

export { PostService };
