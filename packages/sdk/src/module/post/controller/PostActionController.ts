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
import { EditPostType } from '../types';
import { baseHandleData as utilsBaseHandleData } from '../../../service/utils';
import { ENTITY } from '../../../service/eventKey';
import { ProgressService } from '../../index';
import { notificationCenter, GroupConfigService } from '../../../service';
import { mainLogger } from 'foundation';

type HandlePostType = {
  data: Raw<Post> | Raw<Post>[] | Post | Post[];
  shouldCheckGroup: boolean;
  shouldCheckDisContinue: boolean;
  shouldSave: boolean;
};

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
  async editPost(params: EditPostType) {
    const postDao = daoManager.getDao(PostDao);
    const oldPost = await postDao.get(params.postId);
    if (!oldPost) {
      throw new Error(`invalid post id: ${params.postId}`);
    }
    const newPostInfo = this._helper.buildModifiedPostInfo(params, oldPost);
    const serverTypeInfo = this._helper.transformLocalToServerType(newPostInfo);
    const result = await this.requestController.put(serverTypeInfo);
    this.handlePostResponseData(result);
  }

  async handlePostResponseData(data: Raw<Post> | Raw<Post>[] | Post | Post[]) {
    const paras: HandlePostType = {
      data,
      shouldCheckGroup: false,
      shouldCheckDisContinue: false,
      shouldSave: true,
    };
    return this.handlePost(paras);
  }

  isContinuousWithLocalPost() {
    return true;
  }

  async handlePost(params: HandlePostType) {
    const transformedPost: Post[] = this._helper.transformData(params.data as
      | Raw<Post>[]
      | Raw<Post>);

    const groupedPosts = _.groupBy(transformedPost, 'group_id');
    const postDao = daoManager.getDao(PostDao);
    const normalPosts = _.flatten(
      await Promise.all(
        Object.values(groupedPosts).map(async (posts: Post[]) => {
          let shouldSave = params.shouldSave;
          if (params.shouldCheckDisContinue) {
            shouldSave = this.isContinuousWithLocalPost();
            // shouldSave = !!(await isContinuousWithLocalData(posts));
          }
          const resultPosts = await utilsBaseHandleData({
            data: posts,
            dao: postDao,
            eventKey: ENTITY.POST,
            noSavingToDB: !shouldSave,
          });
          return resultPosts;
        }),
      ),
    );

    if (params.shouldCheckGroup) {
      const groupIds = Object.keys(groupedPosts).map(id => Number(id));
      await this.checkGroups(groupIds);
    }
    return normalPosts;
  }

  async checkGroups(groupIds: number[]) {
    // call group service to make sure all groups in local
  }

  async sendPost() {}

  /**
   * deletePost begin
   */

  private async _deletePreInsertedPost(post: Post): Promise<boolean> {
    /**
     * 1. delete from progress
     * 2. delete indexDB
     * 3. delete from pre inserted config
     * 4. delete from failure config
     */
    // 1
    const progressService: ProgressService = ProgressService.getInstance();
    progressService.deleteProgress(post.id);

    notificationCenter.emitEntityDelete(ENTITY.POST, [post.id]);
    // 2
    const postDao = daoManager.getDao(PostDao);
    postDao.delete(post.id);

    // 3 TODO

    // 4
    const groupConfigService: GroupConfigService = GroupConfigService.getInstance();
    groupConfigService.deletePostId(post.group_id, post.id); // does not need to wait
    return true;
  }

  private async _deletePostFromRemote(post: Post): Promise<boolean> {
    post.deactivated = true;
    const serverTypeInfo = this._helper.transformLocalToServerType(post);
    try {
      const result = await this.requestController.put(serverTypeInfo);
      this.handlePostResponseData(result);
      return true;
    } catch (e) {
      mainLogger.warn(`modify post error ${JSON.stringify(e)}`);
      return false;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    const postDao = daoManager.getDao(PostDao);
    const post = (await postDao.get(id)) as Post;
    if (id < 0) {
      return this._deletePreInsertedPost(post);
    }
    return this._deletePostFromRemote(post);
  }

  /**
   * deletePost end
   */
}

export { PostActionController };
