/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 10:30:10
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { computed } from 'mobx';
import { InputFooterProps } from './types';
class InputFooterViewModel extends AbstractViewModel<InputFooterProps> {
  @computed
  get showMarkupTips(): boolean {
    return this.props.hasInput;
  }
}

export { InputFooterViewModel };
