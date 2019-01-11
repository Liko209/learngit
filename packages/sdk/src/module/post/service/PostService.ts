/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../controller/PostController';
import { Post } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { SendPostType, EditPostType } from '../types';

class NewPostService extends EntityBaseService<Post> {
  static serviceName = 'NewPostService';
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

  async deletePost(id: number) {
    return this.getPostController()
      .getPostActionController()
      .deletePost(id);
  }

  async sendPost(params: SendPostType) {
    return this.getPostController()
      .getPostActionController()
      .sendPost(params);
  }

  async editPost(params: EditPostType) {
    return this.getPostController()
      .getPostActionController()
      .editPost(params);
  }

  async reSendPost(postId: number) {
    return this.getPostController()
      .getPostActionController()
      .reSendPost(postId);
  }
}

export { NewPostService };
