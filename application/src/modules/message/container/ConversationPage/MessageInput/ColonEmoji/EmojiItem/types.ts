/*
 * @Author: ken.li
 * @Date: 2019-06-03 22:15:03
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

type EmojiItemProps = {
  id: number | string;
  selectHandler: Function;
  index: number;
  currentIndex: number;
};

type EmojiItemViewProps = EmojiItemProps & {
  person: PersonModel;
};

export { EmojiItemProps, EmojiItemViewProps };
