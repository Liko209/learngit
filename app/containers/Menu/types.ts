/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

import { MouseEvent } from 'react';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
type MenuProps = {
  id: number;
};

type MenuViewProps = {
  id: number;
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  favoriteText: string;
  menuOpen: boolean;
  shouldSkipCloseConfirmation: boolean;
  umiHint?: boolean;
  onMenuClose: (event: MouseEvent<HTMLElement>) => void;
  toggleFavorite: () => void;
  closeConversation: (
    shouldSkipNextTime: boolean,
  ) => Promise<ServiceCommonErrorType>;
};

export { MenuProps, MenuViewProps };
