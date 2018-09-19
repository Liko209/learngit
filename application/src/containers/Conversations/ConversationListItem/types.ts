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
};

type ConversationListItemViewProps = {
  id: number;
  displayName: string;
  unreadCount: number;
  umiVariant: 'count' | 'dot' | 'auto';
  status?: 'default' | 'offline' | 'online' | 'away';
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  favoriteText: string;
  menuOpen: boolean;
  shouldSkipCloseConfirmation: boolean;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onMoreClick: (event: MouseEvent<HTMLElement>) => void;
  toggleFavorite: () => void;
  onMenuClose: (event: MouseEvent<HTMLElement>) => void;
  closeConversation: (
    shouldSkipNextTime: boolean,
  ) => Promise<ServiceCommonErrorType>;
};

export { ConversationListItemProps, ConversationListItemViewProps };
