/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-05 11:24:40
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager, ItemDao, PostDao } from '../../dao';
// import GroupDao from 'dao/group';
import PostAPI from '../../api/glip/post';
import BaseService from '../../service/BaseService';
import PostServiceHandler from '../../service/post/postServiceHandler';
import ItemService from '../../service/item';
import itemHandleData from '../../service/item/handleData';
import ProfileService from '../../service/profile';
import notificationCenter from '../notificationCenter';
import { baseHandleData, handleDataFromSexio } from './handleData';
import { Post, Profile, Item, Raw } from '../../models';
import { PostStatusHandler } from './postStatusHandler';
import { POST_STATUS } from '../constants';
import { ENTITY, SOCKET } from '../eventKey';
import { transform } from '../utils';
import { ErrorParser } from '../../utils/error';
import { RawPostInfo, RawPostInfoWithFile } from './types';
import { mainLogger } from 'foundation';
export interface IPostResult {
  posts: Post[];
  items: Item[];
  hasMore: boolean;
}

export interface IRawPostResult {
  posts: Raw<Post>[];
  items: Raw<Item>[];
  hasMore: boolean;
}

export interface IPostQuery {
  groupId: number;
  offset?: number;
  limit?: number;
  postId?: number;
  direction?: string;
}

export type PostData = {
  id: number;
  data: Post;
};

export type PostSendData = {
  id: number;
  status: POST_STATUS;
};

export default class PostService extends BaseService<Post> {
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
      posts: [],
      items: [],
      hasMore: true,
    };
    if (posts.length !== 0) {
      result.posts = posts;
      let itemIds: number[] = [];
      posts.forEach((post: Post) => {
        if (post.item_ids && post.item_ids[0]) {
          itemIds = itemIds.concat(post.item_ids);
        }
        if (post.at_mention_item_ids && post.at_mention_item_ids[0]) {
          itemIds = itemIds.concat(post.at_mention_item_ids);
        }
      });
      const itemDao = daoManager.getDao(ItemDao);
      result.items = await itemDao.getItemsByIds([
        ...Array.from(new Set(itemIds)),
      ]);
    }
    return result;
  }

  async getPostsFromRemote({
    groupId,
    postId,
    limit,
    direction,
  }: IPostQuery): Promise<IRawPostResult> {
    const params: any = {
      limit,
      direction,
      group_id: groupId,
    };
    if (postId) {
      params.post_id = postId;
    }

    const requestResult = await PostAPI.requestPosts(params);
    const result: IRawPostResult = {
      posts: [],
      items: [],
      hasMore: false,
    };
    if (requestResult && requestResult.data) {
      result.posts = requestResult.data.posts;
      result.items = requestResult.data.items;
      if (result.posts.length === limit) {
        result.hasMore = true;
      }
    }
    return result;
  }

  async getPostsByGroupId({
    groupId,
    offset = 0,
    postId = 0,
    limit = 20,
  }: IPostQuery): Promise<IPostResult> {
    try {
      const result = await this.getPostsFromLocal({
        groupId,
        offset,
        limit,
      });
      if (result.posts.length !== 0) {
        return result;
      }

      // should try to get more posts from server
      mainLogger.debug(
        `getPostsByGroupId groupId:${groupId} postId:${postId} limit:${limit} offset:${offset}} no data in local DB, should do request`,
      );

      const remoteResult = await this.getPostsFromRemote({
        groupId,
        postId,
        limit,
        direction: 'older',
      });

      const posts: Post[] = (await baseHandleData(remoteResult.posts)) || [];
      const items = (await itemHandleData(remoteResult.items)) || [];
      return {
        posts,
        items,
        hasMore: remoteResult.hasMore,
      };
    } catch (e) {
      mainLogger.error(e);
      return {
        posts: [],
        items: [],
        hasMore: true,
      };
    }
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
      if (resp && !resp.data.error) {
        return this.handleSendPostSuccess(resp.data, preInsertId);
      }

      // error, notifiy, should add error handle after IResponse give back error info
      throw resp;
    } catch (e) {
      mainLogger.warn('crash of innerSendPost()');
      this.handleSendPostFail(preInsertId);
      throw ErrorParser.parse(e);
    }
  }

  async handlePreInsertProcess(buildPost: Post): Promise<void> {
    this._postStatusHandler.setPreInsertId(buildPost.id);
    notificationCenter.emitEntityPut(ENTITY.POST, [buildPost]);
    const dao = daoManager.getDao(PostDao);
    await dao.put(buildPost);
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
    notificationCenter.emitEntityReplace(ENTITY.POST, result);
    const dao = daoManager.getDao(PostDao);
    await dao.delete(preInsertId);
    await dao.put(post);
    return result;
  }

  async handleSendPostFail(preInsertId: number) {
    this._postStatusHandler.setPreInsertId(preInsertId, POST_STATUS.FAIL);
    const dao = daoManager.getDao(PostDao);
    const updateData = {
      id: preInsertId,
      status: POST_STATUS.FAIL,
    };
    dao.update(updateData);
    notificationCenter.emitEntityUpdate(ENTITY.POST, [updateData]);
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
        const posts = await baseHandleData(resp.data);
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
        const result = await baseHandleData(resp.data);
        return result[0];
      }
      return null;
    } catch (e) {
      mainLogger.warn(`modify post error ${JSON.stringify(e)}`);
      return null;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    if (this.isInPreInsert(id)) {
      this._postStatusHandler.removePreInsertId(id);
      notificationCenter.emitEntityDelete(ENTITY.POST, [{ id }]);
      const dao = daoManager.getDao(PostDao);
      dao.delete(id);
      return true;
    }
    const postDao = daoManager.getDao(PostDao);
    const post = await postDao.get(id);
    if (post) {
      post.deactivated = true;
      post._id = post.id;
      delete post.id;
      try {
        const resp = await PostAPI.putDataById<Post>(id, post);
        if (resp && !resp.data.error) {
          return true;
        }
        throw resp;
      } catch (e) {
        throw ErrorParser.parse(e);
      }
    }
    return false;
  }

  async likePost(
    postId: number,
    personId: number,
    toLike: boolean,
  ): Promise<Post | null> {
    if (postId < 0) {
      return null;
    }
    const postDao = daoManager.getDao(PostDao);
    const post = await postDao.get(postId);

    if (post) {
      post.likes = post.likes || [];
      if (toLike) {
        if (post.likes.indexOf(personId) === -1) {
          post.likes.push(personId);
        } else {
          return post;
        }
      } else {
        if (post.likes.indexOf(personId) !== -1) {
          post.likes = post.likes.filter((id: number) => id !== personId);
        } else {
          return post;
        }
      }
      post._id = post.id;
      delete post.id;
      const response = await PostAPI.putDataById<Post>(postId, post);
      if (response.data) {
        const result = await baseHandleData(response.data);
        if (result && result.length) {
          return result[0];
        }
      }
      // error
      return null;
    }

    // error
    return null;
  }

  async bookmarkPost(postId: number, toBook: boolean): Promise<Profile | null> {
    // favorite_post_ids in profile
    const profileService: ProfileService = ProfileService.getInstance();
    const profile: Profile | null = await profileService.putFavoritePost(
      postId,
      toBook,
    );
    return profile;
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
