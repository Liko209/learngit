/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceResult } from 'sdk/service/ServiceResult';
import { Profile } from 'sdk/models';
import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';

type FavoriteProps = {
  id: number; // personId || conversationId
  size?: IconButtonSize;
  disableToolTip?: boolean;
  isAction?: boolean;
  hideUnFavorite?: boolean;
};

type FavoriteViewProps = {
  disableToolTip?: boolean;
  size: IconButtonSize;
  variant: IconButtonVariant;
  isAction: boolean;
  isFavorite: boolean;
  hideUnFavorite: boolean;
  getFavorite: () => void;
  handlerFavorite: () => Promise<ServiceResult<Profile>>;
};

export { FavoriteProps, FavoriteViewProps };
