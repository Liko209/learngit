/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 13:54:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Post, Raw } from '../../../models';
import _ from 'lodash';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';

class PostActionController {
  constructor(
    public partialModifyController: IPartialModifyController<Post>,
    public requestController: IRequestController<Post>,
  ) {}

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
}

export { PostActionController };
