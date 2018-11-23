/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { IconButtonSize, IconButtonVariant } from 'jui/components/Buttons';

type FavoriteProps = {
  id: number;
  size?: IconButtonSize;
  isAction?: boolean;
};

type FavoriteViewProps = {
  size: IconButtonSize;
  variant: IconButtonVariant;
  isAction: boolean;
  isFavorite: boolean;
  handlerFavorite: () => Promise<ServiceCommonErrorType>;
};

export { FavoriteProps, FavoriteViewProps };
