/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-04-15 10:46:29
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../entity';
import _ from 'lodash';

class PostUtils {
  static transformToPreInsertPost(post: Post): Post {
    const preInsertPost = _.cloneDeep(post);
    if (preInsertPost.unique_id) {
      preInsertPost.version = Number(preInsertPost.unique_id);
    }
    return preInsertPost;
  }
}
export { PostUtils };
