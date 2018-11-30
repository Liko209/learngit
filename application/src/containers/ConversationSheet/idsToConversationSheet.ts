/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-25 10:09:11
 * Copyright © RingCentral. All rights reserved.
 */
import { conversationSheet } from './ConversationSheet';

function idsToConversationSheet(
  itemTypeIds: { [key: number]: number[] },
  postId: number,
) {
  if (!Object.keys(itemTypeIds).length) {
    return null;
  }
  return conversationSheet.dispatch(itemTypeIds, postId);
}

export default idsToConversationSheet;
