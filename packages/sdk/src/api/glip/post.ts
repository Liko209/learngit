/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-05 13:29:50
 */
import { IResponse } from '../NetworkClient';
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
  static requestPosts(params: object): Promise<IResponse<IPostsModel>> {
    return this.glipNetworkClient.get('/posts', params);
  }

  /**
   *  /api/post
   */
  static sendPost(data: object): Promise<IResponse<Raw<Post>>> {
    return this.postData(data);
  }

  static requestById(id: number): Promise<IResponse<Raw<Post>>> {
    return this.getDataById(id);
  }

  static editPost(id: number, data: object): Promise<IResponse<Raw<Post>>> {
    return this.putDataById(id, data);
  }
}

export default PostAPI;
