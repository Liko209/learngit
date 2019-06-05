/*
 * @Author: ken.li
 * @Date: 2019-04-29 18:25:51
 * Copyright © RingCentral. All rights reserved.
 */
// import { observable, action, comparer } from 'mobx';

import { EmojiProps } from './types';
import { StoreViewModel } from '@/store/ViewModel';
import { EmojiGlobalUserConfig } from '../service/EmojiGlobalUserConfig';
import { action, observable } from 'mobx';

class EmojiViewModel extends StoreViewModel<EmojiProps> {
  @observable
  emojiOpenStatus: boolean = EmojiGlobalUserConfig.getEmojiKeepOpen();

  @action
  setEmojiOpenStatus = () => {
    const status = EmojiGlobalUserConfig.getEmojiKeepOpen();
    EmojiGlobalUserConfig.setEmojiKeepOpen(!status);
    this.emojiOpenStatus = !status;
  }
}

export { EmojiViewModel };
