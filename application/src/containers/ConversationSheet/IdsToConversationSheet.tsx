/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
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

type Props = {
  itemTypeIds: { [key: number]: number[] };
  postId: number;
};

@observer
class IdsToConversationSheet extends React.Component<Props> {
  render() {
    const { itemTypeIds, postId } = this.props;
    return <>{idsToConversationSheet(itemTypeIds, postId)}</>;
  }
}

export { IdsToConversationSheet };
