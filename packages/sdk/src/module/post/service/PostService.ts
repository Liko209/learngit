/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../controller/PostController';
import { Post, IPostQuery, IPostResult } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { PostDao } from '../../../module/post/dao';
import { Api } from '../../../api';
import { SendPostType, EditPostType } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constant';
import ProfileService from '../../../service/profile';
import { Item } from '../../../module/item/entity';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SOCKET } from '../../../service';
import { IRemotePostRequest } from '../entity/Post';
import { Raw } from '../../../framework/model';

class NewPostService extends EntityBaseService<Post> {
  static serviceName = 'NewPostService';
  postController: PostController;
  constructor() {
    super(false, daoManager.getDao(PostDao), {
      basePath: '/post',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.POST]: this.handleSexioData,
      }),
    );
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
    limit = DEFAULT_PAGE_SIZE,
    direction = QUERY_DIRECTION.OLDER,
  }: IPostQuery): Promise<IPostResult> {
    return this.getPostController()
      .getPostFetchController()
      .getPostsByGroupId({ groupId, postId, limit, direction });
  }

  async getPostsByIds(
    ids: number[],
  ): Promise<{ posts: Post[]; items: Item[] }> {
    return this.getPostController()
      .getPostFetchController()
      .getPostsByIds(ids);
  }

  async bookmarkPost(postId: number, toBook: boolean) {
    // favorite_post_ids in profile
    const profileService: ProfileService = ProfileService.getInstance();
    return await profileService.putFavoritePost(postId, toBook);
  }

  async getLastPostOfGroup(groupId: number): Promise<Post | null> {
    return this.getPostController()
      .getPostFetchController()
      .getLastPostOfGroup(groupId);
  }

  async groupHasPostInLocal(groupId: number) {
    return this.getPostController()
      .getPostFetchController()
      .groupHasPostInLocal(groupId);
  }

  async getRemotePostsByGroupId(
    params: IRemotePostRequest,
  ): Promise<IPostResult | null> {
    return this.getPostController()
      .getPostFetchController()
      .getRemotePostsByGroupId(params);
  }

  async getPostCountByGroupId(groupId: number): Promise<number> {
    return this.getPostController()
      .getPostFetchController()
      .getPostCountByGroupId(groupId);
  }

  async getPostFromLocal(postId: number): Promise<Post | null> {
    return this.getEntitySource().getEntityLocally(postId);
  }

  async getNewestPostIdOfGroup(groupId: number): Promise<number | null> {
    return this.getPostController()
      .getPostFetchController()
      .getNewestPostIdOfGroup(groupId);
  }

  async removeItemFromPost(postId: number, itemId: number) {
    this.getPostController()
      .getPostActionController()
      .removeItemFromPost(postId, itemId);
  }

  async deletePostsByGroupIds(groupIds: number[], shouldNotify: boolean) {
    this.getPostController()
      .getPostActionController()
      .deletePostsByGroupIds(groupIds, shouldNotify);
  }

  handleIndexData = async (data: Raw<Post>[], maxPostsExceed: boolean) => {
    this.getPostController()
      .getPostDataController()
      .handleIndexPosts(data, maxPostsExceed);
  }

  handleSexioData = async (data: Raw<Post>[]) => {
    this.getPostController()
      .getPostDataController()
      .handleSexioPosts(data);
  }
}

export { NewPostService };
