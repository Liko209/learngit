/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:54:57
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
type ConversationListItemProps = {
  id: number;
  key: number;
  entityName: string;
  isFavorite?: boolean;
  currentUserId?: number;
  currentGroupId?: number;
};

type ConversationListItemViewProps = {
  id: number;
  displayName: string;
  unreadCount: number;
  umiVariant: 'count' | 'dot' | 'auto';
  status?: 'default' | 'offline' | 'online' | 'away';
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
