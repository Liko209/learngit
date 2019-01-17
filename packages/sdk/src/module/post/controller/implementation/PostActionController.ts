/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 13:54:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../../entity';
import { Raw } from '../../../../framework/model';
import _ from 'lodash';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { daoManager, PostDao } from '../../../../dao';
import { EditPostType } from '../../types';
import { GroupConfigService } from '../../../../service';
import { IPostActionController } from '../interface/IPostActionController';
import { IPreInsertController } from '../../../common/controller/interface/IPreInsertController';
class PostActionController implements IPostActionController {
  constructor(
    public partialModifyController: IPartialModifyController<Post>,
    public requestController: IRequestController<Post>,
    public preInsertController: IPreInsertController<Post>,
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

  /**
   * edit post does not need to do pre-insert
   */
  async editPost(params: EditPostType) {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
      originalPost: Post,
    ): Partial<Raw<Post>> => {
      return {
        text: params.text,
        at_mention_non_item_ids: params.mentionIds || [],
        ...partialPost,
      };
    };

    return this.partialModifyController.updatePartially(
      params.postId,
      preHandlePartial,
      async (newPost: Post) => {
        return this.requestController.put(newPost);
      },
    );
  }

  /**
   * deletePost begin
   */

  private async _deletePreInsertedPost(id: number): Promise<boolean> {
    /**
     * 1. delete from progress
     * 2. delete indexDB
     * 3. delete from pre inserted config
     * 4. delete from failure config
     */
    const postDao = daoManager.getDao(PostDao);
    const post = (await postDao.get(id)) as Post;

    this.preInsertController.incomesStatusChange(id, true);

    // 4
    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    groupConfigService.deletePostId(post.group_id, id); // does not need to wait
    return true;
  }

  async deletePost(id: number): Promise<boolean> {
    if (id < 0) {
      return this._deletePreInsertedPost(id);
    }
    return !!this._deletePostFromRemote(id);
  }

  private async _deletePostFromRemote(id: number) {
    const preHandlePartial = (
      partialPost: Partial<Raw<Post>>,
      originalPost: Post,
    ): Partial<Raw<Post>> => {
      return {
        deactivated: true,
        ...partialPost,
      };
    };

    return this.partialModifyController.updatePartially(
      id,
      preHandlePartial,
      async (newPost: Post) => {
        return this.requestController.put(newPost);
      },
    );
  }
}

export { PostActionController };
