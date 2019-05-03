/*
 * @Author: ken.li
 * @Date: 2019-04-29 18:25:51
 * Copyright © RingCentral. All rights reserved.
 */
// import { observable, action, comparer } from 'mobx';

import { EmojiProps, EmojiViewProps } from './types';
import { StoreViewModel } from '@/store/ViewModel';

class EmojiViewModel extends StoreViewModel<EmojiProps>
  implements EmojiViewProps {}

export { EmojiViewModel };
