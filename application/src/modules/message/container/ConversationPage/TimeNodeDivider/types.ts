/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:29:41
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';

type TimeNodeDividerProps = {
  value: string | number;
};

type TimeNodeDividerViewProps = {
  text: PromisedComputedValue<string>;
};

export { TimeNodeDividerProps, TimeNodeDividerViewProps };
