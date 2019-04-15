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
  mode?: string,
) {
  if (!Object.keys(itemTypeIds).length) {
    return null;
  }
  return conversationSheet.dispatch(itemTypeIds, postId, mode);
}

type Props = {
  itemTypeIds: { [key: number]: number[] };
  postId: number;
  mode?: string;
};

@observer
class IdsToConversationSheet extends React.Component<Props> {
  render() {
    const { itemTypeIds, postId, mode } = this.props;
    return <>{idsToConversationSheet(itemTypeIds, postId, mode)}</>;
  }
}

export { IdsToConversationSheet };
