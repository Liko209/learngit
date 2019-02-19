/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 16:48:48
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../../entity/Post';
class PostControllerUtils {
  static isValidPost(post: Post) {
    return post && (post.text.length > 0 || post.item_ids.length > 0);
  }

  static isValidTextMessage(message: string) {
    return message.trim() !== '';
  }
}

export { PostControllerUtils };
