/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceResult } from 'sdk/service/ServiceResult';
import { Profile } from 'sdk/module/profile/entity';
import { MouseEvent } from 'react';

type MenuProps = {
  personId: number;
  groupId: number;
  anchorEl: HTMLElement | null;
  onClose: (event: MouseEvent<HTMLElement>) => void;
};

type MenuViewProps = {
  personId: number;
  groupId: number;
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  favoriteText: string;
  shouldSkipCloseConfirmation: boolean;
  closable: boolean;
  onClose: (event: MouseEvent<HTMLElement>) => void;
  toggleFavorite: () => Promise<ServiceResult<Profile>>;
  closeConversation: (
    shouldSkipNextTime: boolean,
  ) => Promise<ServiceResult<Profile>>;
};

export { MenuProps, MenuViewProps };
