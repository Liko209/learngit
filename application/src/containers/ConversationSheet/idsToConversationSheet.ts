/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-25 10:09:11
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipTypeUtil } from 'sdk/utils';
import { conversationSheet } from './ConversationSheet';

function idsToConversationSheet(ids: number[], postId: number) {
  if (!ids.length) {
    return null;
  }
  const sheets = {};

  ids.forEach((id: number) => {
    const typeId = GlipTypeUtil.extractTypeId(id);
    if (sheets[typeId]) {
      sheets[typeId].push(id);
    } else {
      sheets[typeId] = [id];
    }
  });
  return conversationSheet.dispatch(sheets, postId);
}

export default idsToConversationSheet;
