/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 13:54:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Post } from '../entity';
import { Raw } from '../../../framework/model';
import _ from 'lodash';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { daoManager, PostDao } from '../../../dao';
import PostActionControllerHelper from './PostActionControllerHelper';

class PostActionController {
  private _helper: PostActionControllerHelper;
  constructor(
    public partialModifyController: IPartialModifyController<Post>,
    public requestController: IRequestController<Post>,
  ) {
    this._helper = new PostActionControllerHelper();
  }

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
      originalPost: Post,
    ): Partial<Raw<Post>> => {
      const likes = _.cloneDeep(originalPost.likes) || [];
      const index = likes.indexOf(personId);
      if (toLike) {
        if (index === -1) {
          likes.push(personId);
        }
      } else {
        if (index > -1) {
          likes.splice(index, 1);
        }
      }
      return {
        ...partialPost,
        likes,
      };
    };
    return this.partialModifyController.updatePartially(
      postId,
      preHandlePartial,
      async (newPost: Post) => {
        return this.requestController.put(newPost);
      },
    );
  }

  /**
   * edit post does not need to do pre-insert
   */
  async editPost(postId: number, text: string) {
    const postDao = daoManager.getDao(PostDao);
    const oldPost = await postDao.get(postId);
    if (!oldPost) {
      throw new Error(`invalid post id: ${postId}`);
    }
    // const newPostInfo = this._helper.buildModifiedPostInfo(text, oldPost);
    // this.requestController.put(newPostInfo);
  }
}

export { PostActionController };
