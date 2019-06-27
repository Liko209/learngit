/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 10:30:10
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { computed } from 'mobx';
import { InputFooterProps } from './types';
import { TypingListHandler } from './TypingListHandler';

class InputFooterViewModel extends AbstractViewModel<InputFooterProps> {
  typingListHandler = new TypingListHandler();

  @computed
  get typingList() {
    return this.typingListHandler.typingList;
  }

  @computed
  get showTypingIndicator(): boolean {
    return this.typingList.length > 0;
  }

  @computed
  get showMarkupTips(): boolean {
    return !this.showTypingIndicator && this.props.hasInput;
  }

  dispose() {
    super.dispose();
    this.typingListHandler.dispose();
  }
}

export { InputFooterViewModel };
