/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */
import { promisedComputed } from 'computed-async-mobx';
import { AbstractViewModel } from '@/base';
import { TimeNodeDividerProps, TimeNodeDividerViewProps } from './types';
import { dividerTimestamp } from '@/utils/date';

class TimeNodeDividerViewModel extends AbstractViewModel<TimeNodeDividerProps>
  implements TimeNodeDividerViewProps {
  text = promisedComputed(`${this.props && this.props.value}`, async () => {
    const { value } = this.props;
    if (typeof value === 'string') {
      return value;
    }
    return dividerTimestamp(value);
  });
}

export { TimeNodeDividerViewModel };
