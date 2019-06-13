/*
 * @Author: ken.li
 * @Date: 2019-06-03 21:50:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { EmojiItemView } from './EmojiItem.View';
import { EmojiItemViewModel } from './EmojiItem.ViewModel';
import { EmojiItemProps } from './types';

const EmojiItem = buildContainer<EmojiItemProps>({
  View: EmojiItemView,
  ViewModel: EmojiItemViewModel,
});

export { EmojiItem };
