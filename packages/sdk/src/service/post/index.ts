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
import { ESendStatus, PostSendStatusHandler } from '../../service/post/postSendStatusHandler';
import { ENTITY, SOCKET } from '../eventKey';
import { transform } from '../utils';
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
  status: ESendStatus;
};

export default class PostService extends BaseService<Post> {
  static serviceName = 'PostService';

  private postSendStatusHandler: PostSendStatusHandler;
  constructor() {
    const subscriptions = {
      [SOCKET.POST]: handleDataFromSexio
    };
    super(PostDao, PostAPI, baseHandleData, subscriptions);
    this.postSendStatusHandler = new PostSendStatusHandler();
  }

  async getPostsFromLocal({ groupId, offset, limit }: IPostQuery): Promise<IPostResult> {
    const postDao = daoManager.getDao(PostDao);
    const posts: Post[] = await postDao.queryPostsByGroupId(groupId, offset, limit);
    const result: IPostResult = {
      posts: [],
      items: [],
      hasMore: true
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
      result.items = await itemDao.getItemsByIds([...Array.from(new Set(itemIds))]);
    }
    return result;
  }

  async getPostsFromRemote({ groupId, postId, limit, direction }: IPostQuery): Promise<IRawPostResult> {
    const params: any = {
      group_id: groupId,
      limit,
      direction
    };
    if (postId) {
      params.post_id = postId;
    }

    const requestResult = await PostAPI.requestPosts(params);
    const result: IRawPostResult = {
      posts: [],
      items: [],
      hasMore: false
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

  async getPostsByGroupId({ groupId, offset, postId = 0, limit = 20 }: IPostQuery): Promise<IPostResult> {
    try {
      const result = await this.getPostsFromLocal({
        groupId,
        offset,
        limit
      });
      if (result.posts.length !== 0) {
        return result;
      }
      // should try to get more posts from server
      mainLogger.debug(
        `getPostsByGroupId groupId:${groupId} postId:${postId} limit:${limit} offset:${offset}} no data in local DB, should do request`
      );
      const remoteResult = await this.getPostsFromRemote({ groupId, postId, limit, direction: 'older' });
      const posts: Post[] = (await baseHandleData(remoteResult.posts)) || [];
      const items = (await itemHandleData(remoteResult.items)) || [];
      return {
        posts,
        items,
        hasMore: remoteResult.hasMore
      };
    } catch (e) {
      mainLogger.error(e);
      return {
        posts: [],
        items: [],
        hasMore: true
      };
    }
  }

  async getPostSendStatus(id: number): Promise<PostSendData> {
    return {
      id,
      status: await this.postSendStatusHandler.getStatus(id)
    };
  }

  async isVersionInPreInsert(version: number): Promise<{ existed: boolean; id: number }> {
    return this.postSendStatusHandler.isVersionInPreInsert(version);
  }

  async sendPost(params: RawPostInfo): Promise<PostData[] | null> {
    // handle params, if has file item, should send file first then send post
    mainLogger.info('start to send log');
    const info: Post = PostServiceHandler.buildPostInfo(params);
    return this.innerSendPost(info);
  }

  async reSendPost(postId: number): Promise<PostData[] | null> {
    if (postId < 0) {
      const dao = daoManager.getDao(PostDao);
      let post = await dao.get(postId);
      if (post) {
        post = PostServiceHandler.buildResendPostInfo(post);
        return this.innerSendPost(post);
      }
    }
    return null;
  }

  async innerSendPost(info: Post): Promise<PostData[] | null> {
    if (info) {
      await this.handlePreInsertProcess(info);
      const id = info.id;
      delete info.id;
      try {
        let resp = await PostAPI.sendPost(info);
        if (resp && resp.data) {
          info.id = id;
          return this.handleSendPostSuccess(resp.data, info);
          // resp = await baseHandleData(resp.data);
        } else {
          // error, notifiy, should add error handle after IResponse give back error info
          return this.handleSendPostFail(id, info.version);
        }
      } catch (e) {
        mainLogger.warn('crash of innerSendPost()');
        return this.handleSendPostFail(id, info.version);
      }
    }
    return null;
  }

  async handlePreInsertProcess(postInfo: Post): Promise<void> {
    this.postSendStatusHandler.addIdAndVersion(postInfo.id, postInfo.version);
    notificationCenter.emitEntityPut(ENTITY.POST, [postInfo]);
    notificationCenter.emitEntityPut(ENTITY.POST_SENT_STATUS, [
      {
        id: postInfo.id,
        status: ESendStatus.INPROGRESS
      }
    ]);
    const dao = daoManager.getDao(PostDao);
    await dao.put(postInfo);
  }

  async handleSendPostSuccess(data: Raw<Post>, oldPost: Post): Promise<PostData[]> {
    this.postSendStatusHandler.removeVersion(oldPost.version);
    const post = transform<Post>(data);
    const obj: PostData = {
      id: oldPost.id,
      data: post
    };
    const result = [obj];
    notificationCenter.emitEntityReplace(ENTITY.POST, result);
    const dao = daoManager.getDao(PostDao);
    await dao.delete(oldPost.id);
    await dao.put(post);
    return result;
  }

  async handleSendPostFail(id: number, version: number) {
    this.postSendStatusHandler.removeVersion(version);
    notificationCenter.emitEntityPut(ENTITY.POST_SENT_STATUS, [
      {
        id,
        status: ESendStatus.FAIL
      }
    ]);
    return [];
  }

  async sendItemFile(params: RawPostInfoWithFile): Promise<Post | null> {
    try {
      // {groupId, file}
      if (!params.groupId) {
        return null;
      }
      let itemService: ItemService = ItemService.getInstance();
      let result = await itemService.sendFile(params);
      if (result) {
        // result is file item
        const options = {
          text: '',
          itemIds: [Number(result.id)],
          groupId: Number(params.groupId)
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

  async deletePost(id: number): Promise<Post | null> {
    if (id < 0) {
      return null;
    }
    const postDao = daoManager.getDao(PostDao);
    let post = await postDao.get(id);
    if (post) {
      post.deactivated = true;
      post._id = post.id;
      delete post.id;
      const response = await PostAPI.putDataById<Post>(id, post);
      if (response.data) {
        const result = await baseHandleData(response.data);
        if (result && result.length) {
          return result[0];
        }
      }
      // error
      return null;
    } else {
      // error
      return null;
    }
  }

  async likePost(postId: number, personId: number, toLike: boolean): Promise<Post | null> {
    if (postId < 0) {
      return null;
    }
    const postDao = daoManager.getDao(PostDao);
    let post = await postDao.get(postId);
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
    } else {
      return null;
      // error
    }
  }

  async bookmarkPost(postId: number, toBook: boolean): Promise<Profile | null> {
    // favorite_post_ids in profile
    const profileService: ProfileService = ProfileService.getInstance();
    const profile: Profile | null = await profileService.putFavoritePost(postId, toBook);
    return profile;
  }

  getLastPostOfGroup(groupId: number): Promise<Post | null> {
    const postDao = daoManager.getDao(PostDao);
    return postDao.queryLastPostByGroupId(groupId);
  }
}
