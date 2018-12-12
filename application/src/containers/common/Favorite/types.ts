/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import { IconButtonSize } from 'jui/components/Buttons';

type FavoriteProps = {
  id: number; // personId || conversationId
  size?: IconButtonSize;
};

type FavoriteViewProps = FavoriteProps & {
  getConversationId: () => void;
  conversationId: number;
  isFavorite: boolean;
  handlerFavorite: () => Promise<ServiceCommonErrorType>;
};

export { FavoriteProps, FavoriteViewProps };
