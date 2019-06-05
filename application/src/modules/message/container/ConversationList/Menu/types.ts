/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from 'sdk/module/profile/entity';
import { MouseEvent } from 'react';

type MenuProps = {
  groupId: number;
  anchorEl: HTMLElement | null;
  onClose: (event: MouseEvent<HTMLElement> | UIEvent) => void;
};

type MenuViewProps = {
  groupId: number;
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  isUnread: boolean;
  disabledReadOrUnread: boolean;
  favoriteText: string;
  shouldSkipCloseConfirmation: boolean;
  closable: boolean;
  onClose: (event: MouseEvent<HTMLElement> | UIEvent) => void;
  toggleFavorite: () => Promise<Profile | null>;
  toggleRead: () => Promise<void>;
  closeConversation: (shouldSkipNextTime: boolean) => Promise<Profile | null>;
};

export { MenuProps, MenuViewProps };
