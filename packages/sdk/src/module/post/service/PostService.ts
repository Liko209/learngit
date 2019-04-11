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
import { ProfileService } from '../../profile';
import { Item } from '../../../module/item/entity';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SOCKET } from '../../../service/eventKey';
import { IRemotePostRequest } from '../entity/Post';
import { Raw } from '../../../framework/model';
import { ContentSearchParams } from '../../../api/glip/search';
import { IGroupService } from '../../../module/group/service/IGroupService';
import { PerformanceTracerHolder, PERFORMANCE_KEYS } from '../../../utils';
import { ServiceLoader, ServiceConfig } from '../../../module/serviceLoader';
import { EntityNotificationController } from '../../../framework/controller/impl/EntityNotificationController';
import { AccountUserConfig } from '../../account/config/AccountUserConfig';

class PostService extends EntityBaseService<Post> {
  postController: PostController;
  constructor(private _groupService: IGroupService) {
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

  protected buildNotificationController() {
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();
    return new EntityNotificationController<Post>((post: Post) => {
      return !post.deactivated && post.creator_id !== currentUserId;
    });
  }

  protected getPostController() {
    if (!this.postController) {
      this.postController = new PostController(this._groupService);
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
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
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
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.HANDLE_INCOMING_POST,
      logId,
    );
    this._postDataController.handleIndexPosts(data, maxPostsExceed);
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
  }

  handleSexioData = async (data: Raw<Post>[]) => {
    if (data.length) {
      const posts = this._postDataController.transformData(data);
      if (posts.length) {
        await this._postDataController.handleSexioPosts(posts);
        this.getEntityNotificationController().onReceivedNotification(posts);
      }
    }
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

  async endPostSearch() {
    return await this.getPostController()
      .getPostSearchController()
      .endPostSearch();
  }

  async getSearchContentsCount(params: ContentSearchParams) {
    return await this.getPostController()
      .getPostSearchController()
      .getContentsCount(params);
  }

  private get _postDataController() {
    return this.getPostController().getPostDataController();
  }
}

export { PostService };
