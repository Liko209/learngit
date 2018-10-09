/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:54:57
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';

type ConversationListItemProps = {
  groupId: number;
  selected: boolean;
};

type ConversationListItemViewProps = {
  groupId: number;
  displayName: string;
  unreadCount: number;
  umiHint?: boolean;
  important?: boolean;
  selected: boolean;
  draft?: string;
  sendFailurePostIds: number[];
  onClick: (event: MouseEvent<HTMLElement>) => void;
};

export { ConversationListItemProps, ConversationListItemViewProps };
