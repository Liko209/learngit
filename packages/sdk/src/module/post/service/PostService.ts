/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IGroupConfigService } from 'sdk/module/groupConfig';
import { ItemService } from 'sdk/module/item';
import { ChangeModel } from 'sdk/module/sync/types';
import { Api } from '../../../api';
import { ContentSearchParams } from '../../../api/glip/search';
import { daoManager, QUERY_DIRECTION } from '../../../dao';
import { Raw } from '../../../framework/model';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { SOCKET } from '../../../service/eventKey';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { IGroupService } from '../../group/service/IGroupService';
import { Item } from '../../item/entity';
import { ProfileService } from '../../profile';
import { ServiceConfig, ServiceLoader } from '../../serviceLoader';
import { DEFAULT_PAGE_SIZE } from '../constant';
import { PostController } from '../controller/PostController';
import { PostNotificationController } from '../controller/PostNotificationController';
import { PostDao } from '../dao';
import { IPostQuery, IPostResult, Post } from '../entity';
import { IRemotePostRequest, UnreadPostQuery } from '../entity/Post';
import { EditPostType, SendPostType } from '../types';

class PostService extends EntityBaseService<Post> {
  postController: PostController;
  constructor(
    private _groupService: IGroupService,
    private _groupConfigService: IGroupConfigService,
  ) {
    super({ isSupportedCache: false }, daoManager.getDao(PostDao), {
      basePath: '/post',
      networkClient: Api.glipNetworkClient,
    });
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.POST]: this.handleSexioData,
      }),
    );

    this.setCheckTypeFunc((id: number) =>
      GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_POST),
    );
  }

  protected canSaveRemoteEntity(): boolean {
    return false;
  }

  protected buildNotificationController() {
    return new PostNotificationController();
  }

  protected getPostController() {
    if (!this.postController) {
      this.postController = new PostController(
        this._groupService,
        this._groupConfigService,
        this.getEntitySource(),
      );
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

  editPost(params: EditPostType) {
    return this._isFailedPost(params)
      ? this._editFailedPost(params)
      : this._editSuccessPost(params);
  }

  private _isFailedPost(params: EditPostType) {
    return params.postId < 0;
  }

  private _editSuccessPost(params: EditPostType) {
    return this.getPostController()
      .getPostActionController()
      .editSuccessPost(params);
  }

  private _editFailedPost(params: EditPostType) {
    return this.getPostController()
      .getSendPostController()
      .editFailedPost(params);
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
      .getPostsByGroupId({
        groupId,
        postId,
        limit,
        direction,
      });
  }

  async getPostsByIds(
    ids: number[],
  ): Promise<{ posts: Post[]; items: Item[] }> {
    return this.getPostController()
      .getDiscontinuousPostFetchController()
      .getPostsByIds(ids);
  }

  async getUnreadPostsByGroupId(unreadPostQuery: UnreadPostQuery) {
    return this.getPostController()
      .getPostFetchController()
      .getUnreadPostsByGroupId(unreadPostQuery);
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
  ): Promise<{ posts: Post[]; items: any[]; hasMore: boolean } | null> {
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

  handleIndexData = async (
    data: Raw<Post>[],
    maxPostsExceed: boolean,
    changeMap?: Map<string, ChangeModel>,
  ) => {
    await this.getPostController()
      .getPostDataController()
      .handleIndexPosts(data, maxPostsExceed, changeMap);
  };

  handleSexioData = async (data: Raw<Post>[]) => {
    if (data.length) {
      const posts = this._postDataController.transformData(data);
      if (posts.length) {
        await this._postDataController.handleSexioPosts(posts);
        this.getEntityNotificationController().onReceivedNotification(posts);
      }
    }
  };

  async searchPosts(params: ContentSearchParams) {
    return await this.getPostController()
      .getPostSearchController()
      .startSearch(params);
  }

  async scrollSearchPosts(key: string) {
    return await this.getPostController()
      .getPostSearchController()
      .scrollSearch(key);
  }

  async endPostSearch(key: string) {
    return await this.getPostController()
      .getPostSearchController()
      .endSearch(key);
  }

  async getLatestPostIdByItem(groupId: number, itemId: number) {
    return await this.getPostController()
      .getPostItemController()
      .getLatestPostIdByItem(groupId, itemId);
  }

  async shareItem(postId: number, itemId: number, targetGroupId: number) {
    return await this.getPostController()
      .getSendPostController()
      .shareItem(postId, itemId, targetGroupId);
  }

  private get _postDataController() {
    return this.getPostController().getPostDataController();
  }

  async initPosts(groupId: number) {
    const posts = await daoManager.getDao(PostDao).initPosts(groupId);
    const itemService = ServiceLoader.getInstance<ItemService>(ServiceConfig.ITEM_SERVICE);
    await itemService.getByPosts(posts);
    return posts;
  }

}

export { PostService };

