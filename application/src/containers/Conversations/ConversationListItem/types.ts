/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:54:57
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
import GroupModel from '@/store/models/Group';
type ConversationListItemProps = {
  id: number;
  key: number;
  entityName: string;
  isFavorite?: boolean;
  currentUserId?: number;
};

type ConversationListItemViewProps = {
  id: number;
  group: GroupModel;
  displayName: string;
  unreadCount: number;
  umiVariant: 'count' | 'dot' | 'auto';
  status?: 'default' | 'offline' | 'online' | 'away';
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  favoriteText: string;
  menuOpen: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onMoreClick: (event: MouseEvent<HTMLElement>) => void;
  onFavoriteTogglerClick: (event: MouseEvent<HTMLElement>) => void;
  onCloseClick: (event: MouseEvent<HTMLElement>) => void;
  onMenuClose: (event: MouseEvent<HTMLElement>) => void;
};

export { ConversationListItemProps, ConversationListItemViewProps };
