/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:20:01
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { daoManager, PostDao, GroupConfigDao } from '../../dao';
// import GroupDao from 'dao/group';
import PostAPI from '../../api/glip/post';
import BaseService from '../../service/BaseService';
import PostServiceHandler from '../../service/post/postServiceHandler';
import ItemService from '../../service/item';
import itemHandleData from '../../service/item/handleData';
import ProfileService from '../../service/profile';
import GroupService from '../../service/group';
import notificationCenter from '../notificationCenter';
import { baseHandleData, handleDataFromSexio } from './handleData';
import { Post, Item, Raw } from '../../models';
import { PostStatusHandler } from './postStatusHandler';
import { POST_STATUS } from '../constants';
import { ENTITY, SOCKET } from '../eventKey';
import { transform } from '../utils';
import { RawPostInfo, RawPostInfoWithFile } from './types';
import { mainLogger } from 'foundation';
import { ErrorParser, BaseError } from '../../utils/error';

interface IPostResult {
  posts: Post[];
  items: Item[];
  hasMore: boolean;
  offset?: number;
  limit?: number;
}

interface IRawPostResult {
  posts: Raw<Post>[];
  items: Raw<Item>[];
  hasMore: boolean;
}

interface IPostQuery {
  groupId: number;
  offset?: number;
  limit?: number;
  postId?: number;
  direction?: string;
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
    offset,
    limit,
  }: IPostQuery): Promise<IPostResult> {
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(
      groupId,
      offset,
      limit,
    );
    const result: IPostResult = {
      offset,
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
    if (group && !group.most_recent_post_id) {
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
    // if (!result.hasMore) {
    //   await groupService.markAsNoPost(groupId);
    // }
  }

  async getPostsByGroupId({
    groupId,
    offset = 0,
    postId = 0,
    limit = 20,
    direction = 'older',
  }: IPostQuery): Promise<IPostResult> {
    try {
      const result = await this.getPostsFromLocal({
        groupId,
        offset,
        limit,
      });
      if (result.posts.length < limit) {
        const groupConfigDao = daoManager.getDao(GroupConfigDao);
        const hasMoreRemote = await groupConfigDao.hasMoreRemotePost(groupId);
        if (hasMoreRemote) {
          // should try to get more posts from server
          mainLogger.debug(
            `getPostsByGroupId groupId:${groupId} postId:${postId} limit:${limit} offset:${offset}} no data in local DB, should do request`,
          );

          const lastPost = _.last(result.posts);

          const remoteResult = await this.getPostsFromRemote({
            groupId,
            direction,
            postId: lastPost ? lastPost.id : postId,
            limit: limit - result.posts.length,
          });

          const posts: Post[] =
            (await baseHandleData(remoteResult.posts, true, true)) || [];
          const items = (await itemHandleData(remoteResult.items)) || [];

          result.posts.push(...posts);
          result.items.push(...items);
          result.hasMore = remoteResult.hasMore;
          await groupConfigDao.update({
            id: groupId,
            has_more: remoteResult.hasMore,
          });
        } else {
          result.hasMore = false;
        }
      }

      result.limit = limit;
      result.offset = offset;

      return result;
    } catch (e) {
      mainLogger.error(`getPostsByGroupId: ${JSON.stringify(e)}`);
      return {
        offset,
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
    const dao = daoManager.getDao(PostDao);
    const localPosts = await dao.queryManyPostsByIds(ids);
    const result = {
      posts: localPosts,
      items: await itemService.getByPosts(localPosts),
    };
    const restIds = _.difference(ids, localPosts.map(({ id }) => id));
    if (restIds.length) {
      const remoteResult = await PostAPI.requestByIds(restIds);
      const remoteData = remoteResult.expect('getPostsByIds failed');
      const posts: Post[] = (await baseHandleData(remoteData.posts)) || [];
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
    // handle params, if has file item, should send file first then send post
    mainLogger.info('start to send post log');
    const buildPost: Post = PostServiceHandler.buildPostInfo(params);
    return this.innerSendPost(buildPost);
  }

  async reSendPost(postId: number): Promise<PostData[] | null> {
    if (this.isInPreInsert(postId)) {
      const dao = daoManager.getDao(PostDao);
      let post = await dao.get(postId);
      if (post) {
        post = PostServiceHandler.buildResendPostInfo(post);
        return this.innerSendPost(post);
      }
    }
    return null;
  }

  async innerSendPost(buildPost: Post): Promise<PostData[]> {
    await this.handlePreInsertProcess(buildPost);
    const { id: preInsertId } = buildPost;
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

  async handlePreInsertProcess(buildPost: Post): Promise<void> {
    this._postStatusHandler.setPreInsertId(buildPost.id);
    const dao = daoManager.getDao(PostDao);
    await dao.put(buildPost);
    try {
      notificationCenter.emitEntityUpdate(ENTITY.POST, [buildPost]);
    } catch (err) {}
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

  async sendItemFile(params: RawPostInfoWithFile): Promise<Post | null> {
    try {
      // {groupId, file}
      if (!params.groupId) {
        return null;
      }
      const itemService: ItemService = ItemService.getInstance();
      const result = await itemService.sendFile(params);
      if (result) {
        // result is file item
        const options = {
          text: '',
          itemIds: [Number(result.id)],
          groupId: Number(params.groupId),
        };
        const info = PostServiceHandler.buildPostInfo(options);
        delete info.id; // should merge sendItemFile function into sendPost
        const resp = await PostAPI.sendPost(info);
        const data = resp.expect('sendPost failed');
        const posts = await baseHandleData(data);
        return posts[0];
      }
      return null;
    } catch (e) {
      mainLogger.error(`post service sendItemFile error${e}`);
      return null;
    }
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
  ): Promise<Post | BaseError> {
    try {
      newPost._id = newPost.id;
      delete newPost.id;
      const response = await PostAPI.putDataById<Post>(newPost._id, newPost);
      const data = response.expect('update post failed');
      if (handleDataFunc) {
        const result = await handleDataFunc(data);
        if (result) {
          return result;
        }
      } else {
        const latestPostModel: Post = transform(data);
        return latestPostModel;
      }
      return ErrorParser.parse(response);
    } catch (e) {
      return ErrorParser.parse(e);
    }
  }

  private async _doUpdateModel(updatedModel: Post) {
    return await this._requestUpdatePost(updatedModel);
  }

  async likePost(postId: number, personId: number, toLike: boolean) {
    try {
      const postDao = daoManager.getDao(PostDao);
      const post = await postDao.get(postId);
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

        this.handlePartialUpdate(
          partialModel,
          undefined,
          this._doUpdateModel.bind(this),
        );
      }
    } catch (e) {
      throw ErrorParser.parse(e);
    }
  }

  async bookmarkPost(postId: number, toBook: boolean) {
    try {
      // favorite_post_ids in profile
      const profileService: ProfileService = ProfileService.getInstance();
      await profileService.putFavoritePost(postId, toBook);
    } catch (e) {
      throw ErrorParser.parse(e);
    }
  }

  getLastPostOfGroup(groupId: number): Promise<Post | null> {
    const postDao = daoManager.getDao(PostDao);
    return postDao.queryLastPostByGroupId(groupId);
  }

  async groupHasPostInLocal(groupId: number) {
    const postDao: PostDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(groupId, 0, 1);
    return posts.length !== 0;
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
