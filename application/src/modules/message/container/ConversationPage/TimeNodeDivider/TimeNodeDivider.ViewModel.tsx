/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { TimeNodeDividerProps, TimeNodeDividerViewProps } from './types';
import { dividerTimestamp } from '@/utils/date';

class TimeNodeDividerViewModel extends AbstractViewModel<TimeNodeDividerProps>
  implements TimeNodeDividerViewProps {
  @computed
  get text() {
    const { value } = this.props;
    if (typeof value === 'string') {
      return value;
    }
    return dividerTimestamp(value);
  }
}

export { TimeNodeDividerViewModel };
