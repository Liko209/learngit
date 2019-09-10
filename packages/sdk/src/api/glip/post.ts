/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-05 13:29:50
 */
import Api from '../api';
import { Raw } from '../../framework/model';
import { Post } from '../../module/post/entity';
import { Item } from '../../module/item/entity';
import { DEFAULT_RETRY_COUNT } from 'foundation/network';

export interface IPostsModel {
  posts: Raw<Post>[];
  items: Raw<Item>[];
}

class PostAPI extends Api {
  /**
   *
   * @param {*} params
   * params {
   *      group_id:int64 (required)
   *      direction: string (optional)
   *      post_id: int64 (optional)
   *      limit: int64 (optional, up to 1000)
   * }
   */
  static basePath = '/post';
  static requestPosts(params: object) {
    return PostAPI.glipNetworkClient.get<IPostsModel>({
      params,
      path: '/posts',
    });
  }

  /**
   *  /api/post
   */
  static sendPost(data: object) {
    return PostAPI.postData<Post>(data, {
      retryCount: DEFAULT_RETRY_COUNT,
    });
  }

  static requestById(id: number) {
    return PostAPI.getDataById<Post>(id);
  }

  static editPost(id: number, data: object) {
    return PostAPI.putDataById<Post>(id, data, {
      retryCount: DEFAULT_RETRY_COUNT,
    });
  }

  static requestByIds(ids: number[]) {
    return PostAPI.glipNetworkClient.get<IPostsModel>({
      path: '/posts_items_by_ids',
      params: {
        post_ids: ids.join(','),
      },
    });
  }
}

export default PostAPI;
