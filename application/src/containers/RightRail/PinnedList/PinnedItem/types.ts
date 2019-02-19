/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiVirtualCellOnLoadFunc } from 'jui/pattern/VirtualList';

type PinnedItemProps = {
  id: number;
  didLoad: JuiVirtualCellOnLoadFunc;
};

type PinnedItemViewProps = {
  id: number;
  isFile: boolean;
  text: string;
  icon: string;
};

export { PinnedItemProps, PinnedItemViewProps };
