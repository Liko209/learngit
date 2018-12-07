/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */
import { MouseEvent } from 'react';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';

type MenuProps = {
  personId: number;
  groupId: number;
  anchorEl: HTMLElement | null;
  onClose: (event: MouseEvent<HTMLElement>) => void;
};

type MenuViewProps = {
  personId: number;
  groupId: number;
  open: boolean;
  anchorEl: HTMLElement | null;
  isFavorite: boolean;
  favoriteText: string;
  shouldSkipCloseConfirmation: boolean;
  showClose?: boolean;
  onClose: (event: MouseEvent<HTMLElement>) => void;
  toggleFavorite: () => Promise<ServiceCommonErrorType>;
  closeConversation: (
    shouldSkipNextTime: boolean,
  ) => Promise<ServiceCommonErrorType>;
};

export { MenuProps, MenuViewProps };
