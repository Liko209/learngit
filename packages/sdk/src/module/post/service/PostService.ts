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
import { DEFAULT_PAGE_SIZE, LOG_INDEX_DATA_POST } from '../constant';
import { ProfileService } from '../../profile';
import { Item } from '../../../module/item/entity';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SOCKET } from '../../../service/eventKey';
import { IRemotePostRequest } from '../entity/Post';
import { Raw } from '../../../framework/model';
import { ContentSearchParams } from '../../../api/glip/search';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../../utils';
import { mainLogger } from 'foundation';

class PostService extends EntityBaseService<Post> {
  static serviceName = 'PostService';
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
      .getDiscontinuousPostFetchController()
      .getPostsByIds(ids);
  }

  async bookmarkPost(postId: number, toBook: boolean) {
    // favorite_post_ids in profile
    const profileService: ProfileService = ProfileService.getInstance();
    return await profileService.putFavoritePost(postId, toBook);
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
    await this.getPostController()
      .getPostDataController()
      .handleIndexPosts(data, maxPostsExceed);
  }

  handleSexioData = async (data: Raw<Post>[]) => {
    this.getPostController()
      .getPostDataController()
      .handleSexioPosts(data);
  }

  async searchPosts(params: ContentSearchParams) {
    return await this.getPostController()
      .getPostSearchController()
      .searchPosts(params);
  }

  async scrollSearchPosts(requestId: number) {
    return await this.getPostController()
      .getPostSearchController()
      .scrollSearchPosts(requestId);
  }

  async endPostSearch(requestId: number) {
    return await this.getPostController()
      .getPostSearchController()
      .endPostSearch(requestId);
  }

  async getSearchContentsCount(params: ContentSearchParams) {
    return await this.getPostController()
      .getPostSearchController()
      .getContentsCount(params);
  }
}

export { PostService };
