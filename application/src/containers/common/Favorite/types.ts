/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';

type FavoriteProps = {
  id: number; // personId || conversationId
  size?: IconButtonSize;
  isShowTooltip?: boolean;
  isAction?: boolean;
  hideUnFavorite?: boolean;
};

type FavoriteViewProps = {
  isShowTooltip?: boolean;
  size: IconButtonSize;
  variant: IconButtonVariant;
  isAction: boolean;
  isFavorite: boolean;
  hideUnFavorite: boolean;
  getFavorite: () => void;
  handlerFavorite: () => Promise<ServiceCommonErrorType>;
};

export { FavoriteProps, FavoriteViewProps };
