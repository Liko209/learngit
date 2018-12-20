/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:20:01
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { daoManager, PostDao, GroupConfigDao } from '../../dao';
import PostAPI from '../../api/glip/post';
import BaseService from '../../service/BaseService';
import PostServiceHandler from '../../service/post/postServiceHandler';
import ItemService from '../../service/item';
import itemHandleData from '../../service/item/handleData';
import ProfileService from '../../service/profile';
import GroupService from '../../service/group';
import notificationCenter from '../notificationCenter';
import { baseHandleData, handleDataFromSexio } from './handleData';
import { Post, Item, Raw, Group } from '../../models';
import { PostStatusHandler } from './postStatusHandler';
import { POST_STATUS, SENDING_STATUS } from '../constants';
import { ENTITY, SOCKET, SERVICE } from '../eventKey';
import { transform } from '../utils';
import { RawPostInfo } from './types';
import { mainLogger, err, Result } from 'foundation';
import { ErrorParser, BaseError, ErrorTypes } from '../../utils/error';
import { QUERY_DIRECTION } from '../../dao/constants';
import { uniqueArray } from '../../utils';

interface IPostResult {
  posts: Post[];
  items: Item[];
  hasMore: boolean;
  limit?: number;
}

interface IRawPostResult {
  posts: Raw<Post>[];
  items: Raw<Item>[];
  hasMore: boolean;
}

interface IPostQuery {
  groupId: number;
  limit?: number;
  postId?: number;
  direction?: QUERY_DIRECTION;
}

type PostData = {
  id: number;
  data: Post;
};

type PostSendData = {
  id: number;
  status: POST_STATUS;
};

class PostService extends BaseService<Post> {
  static serviceName = 'PostService';

  protected async shouldSaveItemFetchedById(
    item: Raw<Post>,
  ): Promise<boolean | undefined> {
    if (item.group_id) {
      return this.isNewestSaved(item.group_id) && undefined;
    }
    return false;
  }

  private _postStatusHandler: PostStatusHandler;
  constructor() {
    const subscriptions = {
      [SOCKET.POST]: handleDataFromSexio,
    };
    super(PostDao, PostAPI, baseHandleData, subscriptions);
    this._postStatusHandler = new PostStatusHandler();
  }

  async getPostsFromLocal({
    groupId,
    postId,
    direction,
    limit,
  }: IPostQuery): Promise<IPostResult> {
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      postId,
      direction,
      limit,
    );
    const result: IPostResult = {
      limit,
      posts: [],
      items: [],
      hasMore: true,
    };
    if (posts.length !== 0) {
      result.posts = posts;
      const itemService: ItemService = ItemService.getInstance();
      result.items = await itemService.getByPosts(posts);
    }
    return result;
  }

  async getPostsFromRemote({
    groupId,
    postId,
    limit,
    direction,
  }: IPostQuery): Promise<IRawPostResult> {
    const groupService: GroupService = GroupService.getInstance();
    const group = await groupService.getById(groupId);
    if (group && !group.most_recent_post_created_at) {
      // The group has no post
      return {
        posts: [],
        items: [],
        hasMore: false,
      };
    }

    const params: any = {
      limit,
      direction,
      group_id: groupId,
    };
    if (postId) {
      params.post_id = postId;
    }
    try {
      const requestResult = await PostAPI.requestPosts(params);
      const result: IRawPostResult = {
        posts: [],
        items: [],
        hasMore: false,
      };
      const data = requestResult.expect('Get Remote post failed');
      if (data) {
        result.posts = data.posts;
        result.items = data.items;
        if (result.posts.length === limit) {
          result.hasMore = true;
        }
      }
      return result;
    } catch (e) {
      return {
        posts: [],
        items: [],
        hasMore: true,
      };
    }
  }

  async getPostsByGroupId({
    groupId,
    postId = 0,
    limit = 20,
    direction = QUERY_DIRECTION.OLDER,
  }: IPostQuery): Promise<IPostResult> {
    try {
      const result = await this.getPostsFromLocal({
        groupId,
        postId,
        direction,
        limit,
      });
      if (result.posts.length < limit) {
        const groupConfigDao = daoManager.getDao(GroupConfigDao);
        const hasMoreRemote = await groupConfigDao.hasMoreRemotePost(
          groupId,
          direction,
        );
        if (hasMoreRemote) {
          // should try to get more posts from server
          mainLogger.debug(
            `getPostsByGroupId groupId:${groupId} postId:${postId} limit:${limit} direction:${direction} no data in local DB, should do request`,
          );

          const lastPost = _.last(result.posts);

          const remoteResult = await this.getPostsFromRemote({
            groupId,
            direction,
            postId: lastPost ? lastPost.id : postId,
            limit: limit - result.posts.length,
          });

          let shouldSave;
          const includeNewest = await this.includeNewest(
            remoteResult.posts.map(({ _id }) => _id),
            groupId,
          );
          if (includeNewest) {
            shouldSave = true;
          } else {
            shouldSave = await this.isNewestSaved(groupId);
          }
          const posts: Post[] =
            (await baseHandleData(remoteResult.posts, shouldSave)) || [];
          const items = (await itemHandleData(remoteResult.items)) || [];

          result.posts.push(...posts);
          result.items.push(...items);
          result.hasMore = remoteResult.hasMore;
          await groupConfigDao.update({
            id: groupId,
            [`has_more_${direction}`]: remoteResult.hasMore,
          });
        } else {
          result.hasMore = false;
        }
      }

      result.limit = limit;

      return result;
    } catch (e) {
      mainLogger.error(`getPostsByGroupId: ${JSON.stringify(e)}`);
      return {
        limit,
        posts: [],
        items: [],
        hasMore: true,
      };
    }
  }

  async getPostsByIds(
    ids: number[],
  ): Promise<{ posts: Post[]; items: Item[] }> {
    const itemService: ItemService = ItemService.getInstance();
    const localPosts = await this.getModelsLocally(ids, true);
    const result = {
      posts: localPosts,
      items: await itemService.getByPosts(localPosts),
    };
    const restIds = _.difference(ids, localPosts.map(({ id }) => id));
    if (restIds.length) {
      const remoteResult = await PostAPI.requestByIds(restIds);
      const remoteData = remoteResult.expect('getPostsByIds failed');
      const posts: Post[] =
        (await baseHandleData(remoteData.posts, false)) || [];
      const items = (await itemHandleData(remoteData.items)) || [];
      result.posts.push(...posts);
      result.items.push(...items);
    }
    return result;
  }

  isInPreInsert(id: number) {
    return this._postStatusHandler.isInPreInsert(id);
  }

  async sendPost(params: RawPostInfo): Promise<PostData[] | null> {
    mainLogger.info('start to send post log');
    const buildPost: Post = await PostServiceHandler.buildPostInfo(params);
    return this.innerSendPost(buildPost, false);
  }

  async reSendPost(postId: number): Promise<PostData[] | null> {
    if (this.isInPreInsert(postId)) {
      const dao = daoManager.getDao(PostDao);
      let post = await dao.get(postId);
      if (post) {
        post = PostServiceHandler.buildResendPostInfo(post);
        return this.innerSendPost(post, true);
      }
    }
    return null;
  }

  async innerSendPost(buildPost: Post, isResend: boolean): Promise<PostData[]> {
    if (!isResend && buildPost.item_ids.length > 0) {
      this._cleanUploadingFiles(buildPost.group_id);
    }

    await this._handlePreInsertProcess(buildPost);
    if (buildPost.item_ids.length > 0) {
      const pseudoItems = this._getPseudoItemIdsFromPost(buildPost);
      if (pseudoItems.length > 0) {
        if (isResend) {
          this._resendFailedItems(pseudoItems);
        } else {
          if (
            !this._hasItemInTargetStatus(buildPost, SENDING_STATUS.INPROGRESS) // no item in progress
          ) {
            return await this.handleSendPostFail(buildPost.id);
          }
        }

        return await this._sendPostWithPreInsertItems(buildPost);
      }
    }

    return await this._sendPost(buildPost);
  }

  private async _resendFailedItems(pseudoItemIds: number[]) {
    const itemService: ItemService = ItemService.getInstance();
    await itemService.resendFailedItems(pseudoItemIds);
  }

  private async _cleanUploadingFiles(groupId: number) {
    const itemService: ItemService = ItemService.getInstance();
    itemService.cleanUploadingFiles(groupId);
  }

  private _getPseudoItemStatusInPost(post: Post) {
    const itemService: ItemService = ItemService.getInstance();
    return uniqueArray(itemService.getItemsSendingStatus(post.item_ids));
  }

  private _hasItemInTargetStatus(post: Post, status: SENDING_STATUS) {
    return this._getPseudoItemStatusInPost(post).indexOf(status) > -1;
  }

  private async _sendPostWithPreInsertItems(post: Post): Promise<PostData[]> {
    const listener = async (params: {
      status: SENDING_STATUS;
      preInsertId: number;
      updatedId: number;
    }) => {
      const { status, preInsertId, updatedId } = params;
      if (!post.item_ids.includes(preInsertId)) {
        return;
      }

      if (status === SENDING_STATUS.CANCELED) {
        _.remove(post.item_ids, (id: number) => {
          return id === preInsertId;
        });

        if (post.item_ids.length === 0) {
          this.deletePost(post.id);
        }
      } else if (status === SENDING_STATUS.SUCCESS) {
        // update post to db
        if (updatedId !== preInsertId) {
          post.item_ids = post.item_ids.map((id: number) => {
            return id === preInsertId ? updatedId : id;
          });

          if (post.item_data && post.item_data.version_map) {
            const versionMap = post.item_data.version_map;
            Object.keys(versionMap).forEach((strKey: string) => {
              if (strKey === preInsertId.toString()) {
                versionMap[updatedId] = versionMap[preInsertId];
                delete versionMap[preInsertId];
              }
            });
          }

          this._updatePost(_.cloneDeep(post));
        }

        if (this._getPseudoItemIdsFromPost(post).length === 0) {
          notificationCenter.removeListener(
            SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
            listener,
          );
          await this._sendPost(post);
        }
      }

      const itemStatuses = this._getPseudoItemStatusInPost(post);
      // remove listener if item files are not in progress
      if (!this._hasExpectedStatus(SENDING_STATUS.INPROGRESS, itemStatuses)) {
        // has failed
        if (this._hasExpectedStatus(SENDING_STATUS.FAIL, itemStatuses)) {
          this.handleSendPostFail(post.id);
        }

        notificationCenter.removeListener(
          SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS,
          listener,
        );
      }
    };

    notificationCenter.on(SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS, listener);

    const itemService: ItemService = ItemService.getInstance();
    itemService.sendItemData(post.group_id, post.item_ids);

    return [];
  }

  private async _updatePost(post: Post) {
    const postDao = daoManager.getDao(PostDao);
    await postDao.update(post);
  }

  private _hasExpectedStatus(
    targetStatus: SENDING_STATUS,
    statusArr: SENDING_STATUS[],
  ) {
    return statusArr.indexOf(targetStatus) > -1;
  }

  private _getPseudoItemIdsFromPost(post: Post) {
    return post.item_ids.filter(x => x < 0);
  }

  private async _handlePreInsertProcess(buildPost: Post): Promise<void> {
    this._postStatusHandler.setPreInsertId(buildPost.id);
    const dao = daoManager.getDao(PostDao);
    await dao.put(buildPost);
    notificationCenter.emitEntityUpdate(ENTITY.POST, [buildPost]);
  }

  private async _sendPost(buildPost: Post): Promise<PostData[]> {
    const preInsertId = buildPost.id;
    delete buildPost.id;
    delete buildPost.status;

    try {
      const resp = await PostAPI.sendPost(buildPost);
      const data = resp.expect('send post failed');
      return this.handleSendPostSuccess(data, preInsertId);
    } catch (e) {
      this.handleSendPostFail(preInsertId);
      throw ErrorParser.parse(e);
    }
  }

  async handleSendPostSuccess(
    data: Raw<Post>,
    preInsertId: number,
  ): Promise<PostData[]> {
    this._postStatusHandler.removePreInsertId(preInsertId);
    const post = transform<Post>(data);
    const obj: PostData = {
      id: preInsertId,
      data: post,
    };
    const result = [obj];
    const replacePosts = new Map<number, Post>();
    replacePosts.set(preInsertId, post);

    notificationCenter.emitEntityReplace(ENTITY.POST, replacePosts);
    const dao = daoManager.getDao(PostDao);

    const groupService: GroupService = GroupService.getInstance();
    const failIds = await groupService.getGroupSendFailurePostIds(
      post.group_id,
    );
    const index = failIds.indexOf(preInsertId);
    if (index > -1) {
      failIds.splice(index, 1);
      groupService.updateGroupSendFailurePostIds({
        id: post.group_id,
        send_failure_post_ids: failIds,
      });
    }
    await dao.delete(preInsertId);
    await dao.put(post);
    return result;
  }

  async handleSendPostFail(preInsertId: number) {
    this._postStatusHandler.setPreInsertId(preInsertId, POST_STATUS.FAIL);
    const updateData = {
      id: preInsertId,
      _id: preInsertId,
      status: POST_STATUS.FAIL,
    };
    let groupId: number = 0;

    await this.handlePartialUpdate(
      updateData,
      undefined,
      async (updatedPost: Post) => {
        groupId = updatedPost.group_id;
        return updatedPost;
      },
    );

    const groupService: GroupService = GroupService.getInstance();
    const failIds = await groupService.getGroupSendFailurePostIds(groupId);
    groupService.updateGroupSendFailurePostIds({
      id: groupId,
      send_failure_post_ids: [...new Set([...failIds, preInsertId])],
    });
    return [];
  }

  async cancelUpload(postId: number, itemId: number) {
    const preHandlePartialPost = (
      partialModel: Partial<Raw<Post>>,
      originalModel: Post,
    ): Partial<Raw<Post>> => {
      const itemIds = originalModel.item_ids.filter((value: number) => {
        return value !== itemId;
      });
      const partialPost = {
        ...partialModel,
        item_ids: itemIds,
      };
      return partialPost;
    };

    const partialModel = { id: postId };
    await this.handlePartialUpdate(
      partialModel,
      preHandlePartialPost,
      async (updatedModel: Post) => {
        const itemService: ItemService = ItemService.getInstance();
        await itemService.cancelUpload(itemId);
        return updatedModel;
      },
    );
  }

  /**
   * POST related operations
   * PIN,LIKE,DELETE,EDIT,FAVORITE
   */
  async modifyPost(params: RawPostInfo): Promise<Post | null> {
    try {
      const post = await PostServiceHandler.buildModifiedPostInfo(params);
      if (params.postId && post) {
        const resp = await PostAPI.editPost(params.postId, post);
        const data = resp.expect('modified post fail');
        const result = await baseHandleData(data);
        return result[0];
      }
      return null;
    } catch (e) {
      mainLogger.warn(`modify post error ${JSON.stringify(e)}`);
      return null;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    const postDao = daoManager.getDao(PostDao);
    const post = (await postDao.get(id)) as Post;

    if (this.isInPreInsert(id)) {
      this._postStatusHandler.removePreInsertId(id);
      notificationCenter.emitEntityDelete(ENTITY.POST, [post.id]);
      postDao.delete(id);

      const groupService: GroupService = GroupService.getInstance();
      const failIds = await groupService.getGroupSendFailurePostIds(
        post.group_id,
      );
      const index = failIds.indexOf(id);
      if (index > -1) {
        failIds.splice(index, 1);
        groupService.updateGroupSendFailurePostIds({
          id: post.group_id,
          send_failure_post_ids: failIds,
        });
      }
      return true;
    }

    if (post) {
      post.deactivated = true;
      post._id = post.id;
      delete post.id;
      try {
        const resp = await PostAPI.putDataById<Post>(id, post);
        resp.expect('delete post failed');
        return true;
      } catch (e) {
        throw ErrorParser.parse(e);
      }
    }
    return false;
  }

  private async _requestUpdatePost(
    newPost: Post,
    handleDataFunc?: (profile: Raw<Post> | null) => Promise<Post | null>,
  ): Promise<Post | null> {
    newPost._id = newPost.id;
    delete newPost.id;
    const result = await PostAPI.putDataById<Post>(newPost._id, newPost);
    if (result.isOk()) {
      if (handleDataFunc) {
        return await handleDataFunc(result.data);
      }
      return transform<Post>(result.data);
    }
    return null;
  }

  private async _doUpdateModel(updatedModel: Post) {
    return this._requestUpdatePost(updatedModel);
  }

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Result<Post>> {
    const post = await this.getById(postId);
    if (post) {
      const likes = post.likes || [];
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

      const partialModel = {
        ...post,
        likes,
      };

      return this.handlePartialUpdate(
        partialModel,
        undefined,
        this._doUpdateModel.bind(this),
      );
    }
    return err(
      new BaseError(
        ErrorTypes.UNDEFINED_ERROR,
        `Post can not find with id ${postId}`,
      ),
    );
  }

  async bookmarkPost(postId: number, toBook: boolean) {
    // favorite_post_ids in profile
    const profileService: ProfileService = ProfileService.getInstance();
    return await profileService.putFavoritePost(postId, toBook);
  }

  getLastPostOfGroup(groupId: number): Promise<Post | null> {
    const postDao = daoManager.getDao(PostDao);
    return postDao.queryLastPostByGroupId(groupId);
  }

  async groupHasPostInLocal(groupId: number) {
    const postDao: PostDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      0,
      undefined,
      1,
    );
    return posts.length !== 0;
  }

  async getNewestPostIdOfGroup(groupId: number): Promise<number | null> {
    const params: any = {
      limit: 1,
      group_id: groupId,
    };
    try {
      const requestResult = await PostAPI.requestPosts(params);
      const data = requestResult.expect('get newest post id of group failed');
      const post = data.posts[0];
      if (post) {
        return post._id;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async includeNewest(postIds: number[], groupId: number): Promise<boolean> {
    const newestPostId = await this.getNewestPostIdOfGroup(groupId);
    if (!newestPostId) {
      return false;
    }
    return postIds.indexOf(newestPostId) >= 0;
  }

  async isNewestSaved(groupId: number): Promise<boolean> {
    const groupConfigDao = daoManager.getDao(GroupConfigDao);
    let isNewestSaved = await groupConfigDao.isNewestSaved(groupId);
    if (isNewestSaved) {
      return true;
    }
    const newestPostId = await this.getNewestPostIdOfGroup(groupId);
    if (!newestPostId) {
      return false;
    }
    const dao = daoManager.getDao(this.DaoClass);
    isNewestSaved = !!(await dao.get(newestPostId));
    await groupConfigDao.update({
      id: groupId,
      is_newest_saved: isNewestSaved,
    });
    return isNewestSaved;
  }

  async newMessageWithPeopleIds(
    ids: number[],
    message: string,
  ): Promise<Result<Group>> {
    const groupService: GroupService = GroupService.getInstance();
    const result = await groupService.getOrCreateGroupByMemberList(ids);
    if (result.isOk()) {
      const id = result.data.id;
      if (id && this._isValidTextMessage(message)) {
        setTimeout(() => {
          this.sendPost({ groupId: id, text: message });
        },         2000);
      }
    }
    return result;
  }

  private _isValidTextMessage(message: string) {
    return message.trim() !== '';
  }

  async deletePostsByGroupIds(groupIds: number[], shouldNotify: boolean) {
    const dao = daoManager.getDao(PostDao);
    const promises = groupIds.map(id => dao.queryPostsByGroupId(id));
    const postsMap = await Promise.all(promises);
    const posts = _.union(...postsMap);
    const ids = posts.map(post => post.id);
    await dao.bulkDelete(ids);
    if (shouldNotify) {
      notificationCenter.emitEntityDelete(ENTITY.POST, ids);
    }
  }
}

export {
  IPostResult,
  IRawPostResult,
  IPostQuery,
  PostData,
  PostSendData,
  PostService,
};
