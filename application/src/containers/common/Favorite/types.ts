/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from 'sdk/module/profile/entity';
import { IconButtonSize } from 'jui/components/Buttons';

type FavoriteProps = {
  id: number; // personId || conversationId
  size?: IconButtonSize;
  dataTrackingProps: {
    source: string;
    conversationType: string;
  };
};

type FavoriteViewProps = FavoriteProps & {
  getConversationId: () => void;
  conversationId: number;
  isFavorite: boolean;
  isMember: boolean;
  handlerFavorite: () => Promise<Profile>;
};

export { FavoriteProps, FavoriteViewProps };
