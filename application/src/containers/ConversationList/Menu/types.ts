/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceResult } from 'sdk/service/ServiceResult';
import { Profile } from 'sdk/models';
import { MouseEvent } from 'react';

type MenuProps = {
  groupId: number;
  anchorEl: HTMLElement | null;
  onClose: (event: MouseEvent<HTMLElement>) => void;
};

type MenuViewProps = {
  groupId: number;
  open: boolean;
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  favoriteText: string;
  shouldSkipCloseConfirmation: boolean;
  showClose?: boolean;
  onClose: (event: MouseEvent<HTMLElement>) => void;
  toggleFavorite: () => Promise<ServiceResult<Profile>>;
  isShowGroupTeamProfile: boolean;
  closeConversation: (
    shouldSkipNextTime: boolean,
  ) => Promise<ServiceResult<Profile>>;
};

export { MenuProps, MenuViewProps };
