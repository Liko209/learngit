/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:54:57
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';

type ConversationListItemProps = {
  groupId: number;
};

type ConversationListItemViewProps = {
  groupId: number;
  displayName: string;
  unreadCount: number;
  anchorEl: HTMLElement | null;
  umiHint?: boolean;
  important?: boolean;
  draft?: string;
  sendFailurePostIds: number[];
  onMenuClose: (event: MouseEvent<HTMLElement>) => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onMoreClick: (event: MouseEvent<HTMLElement>) => void;
};

export { ConversationListItemProps, ConversationListItemViewProps };
