/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-17 16:48:48
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from '../../entity/Post';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

class PostControllerUtils {
  static isValidPost(post: Post) {
    return post && (post.text.length > 0 || post.item_ids.length > 0);
  }

  static isValidTextMessage(message: string) {
    return message.trim() !== '';
  }

  static isSMSPost<T extends { item_ids?: number[]; is_sms?: boolean }>(
    post: T,
  ) {
    if (post.is_sms) {
      return true;
    }

    if (
      post.item_ids &&
      post.item_ids.find(itemId => {
        return !!GlipTypeUtil.isExpectedType(
          itemId,
          TypeDictionary.TYPE_ID_RC_SMSES,
        );
      })
    ) {
      return true;
    }

    return false;
  }
}

export { PostControllerUtils };
