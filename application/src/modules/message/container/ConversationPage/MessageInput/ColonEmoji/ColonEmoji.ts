/*
 * @Author: ken.li
 * @Date: 2019-06-02 16:40:53
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ColonEmojiView } from './ColonEmoji.View';
import { ColonEmojiViewModel } from './ColonEmoji.ViewModel';
import { ColonEmojiProps } from './types';

const ColonEmoji = buildContainer<ColonEmojiProps>({
  View: ColonEmojiView,
  ViewModel: ColonEmojiViewModel,
});

export { ColonEmoji };
