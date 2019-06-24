/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-21 19:33:47
 * Copyright © RingCentral. All rights reserved.
 */
import { AT_MENTION_GROUPED_REGEXP } from '../utils';

class AtMentionTransformer {
  static atMentionDataMap = {};
  static replace(originalStr: string) {
    return originalStr.replace(
      AT_MENTION_GROUPED_REGEXP, // we need to encode the text inside atmention so it won't get parsed first, for example when some crazy user name is a url
      (match, pre, id, content, post) => {
        if (!this.atMentionDataMap[id]) {
          this.atMentionDataMap[id] = content;
        }
        return ` <at_mention id=${id} />`;
      },
    );
  }
}

export { AtMentionTransformer };
