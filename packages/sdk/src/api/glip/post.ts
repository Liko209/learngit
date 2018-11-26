/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-05 13:29:50
 */
import Api from '../api';
import { Post, Item, Raw } from '../../models';

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
    return this.glipNetworkClient.get<IPostsModel>('/posts', params);
  }

  /**
   *  /api/post
   */
  static sendPost(data: object) {
    return this.postData<Raw<Post>>(data);
  }

  static requestById(id: number) {
    return this.getDataById<Post>(id);
  }

  static editPost(id: number, data: object) {
    return this.putDataById<Post>(id, data);
  }

  static requestByIds(ids: number[]) {
    return this.glipNetworkClient.get<IPostsModel>('/posts_items_by_ids', {
      post_ids: ids.join(','),
    });
  }
}

export default PostAPI;
