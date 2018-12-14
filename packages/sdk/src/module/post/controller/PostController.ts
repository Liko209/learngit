/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-14-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post, Raw } from '../../../models';
import { ControllerBuilder } from '../../../framework/controller/ControllerBuilder';

import PostAPI from '../../../api/glip/post';
import { transform } from '../../../service/utils';
import _ from 'lodash';
import { daoManager } from '../../../dao';

class PostController {
  constructor(public DAOClass?: any) {}

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    const controller = ControllerBuilder.buildPartialModifyController<Post>(
      daoManager.getDao(this.DAOClass),
    );
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
    return controller.updatePartially(
      postId,
      preHandlePartial,
      this.requestUpdatePost.bind(this),
    );
  }

  async requestUpdatePost(newPost: Post): Promise<Post | null> {
    newPost._id = newPost.id;
    delete newPost.id;
    const result = await PostAPI.putDataById<Post>(newPost._id, newPost);
    if (result.isOk()) {
      return transform<Post>(result.data);
    }
    return null;
  }
}

export { PostController };
