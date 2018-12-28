/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../controller/PostController';
import { Post } from '../../../models';

class PostService extends EntityBaseService<Post> {
  postController: PostController;
  constructor() {
    super();
  }

  protected getPostController() {
    if (!this.postController) {
      this.postController = new PostController(this.getControllerBuilder());
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
