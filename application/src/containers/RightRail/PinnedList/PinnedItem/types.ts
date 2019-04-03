/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:43:19
 * Copyright © RingCentral. All rights reserved.
 */

type PinnedItemProps = {
  id: number;
};

type PinnedItemViewProps = {
  id: number;
  isFile: boolean;
  text: string;
  icon: string;
};

export { PinnedItemProps, PinnedItemViewProps };
