/*
 * @Author: ken.li
 * @Date: 2019-04-29 15:50:28
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { EmojiView } from './Emoji.View';
import { EmojiViewModel } from './Emoji.ViewModel';
import { EmojiProps } from './types';

const Emoji = buildContainer<EmojiProps>({
  View: EmojiView,
  ViewModel: EmojiViewModel,
});

export { Emoji };
