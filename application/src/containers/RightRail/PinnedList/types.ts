/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 13:53:13
 * Copyright © RingCentral. All rights reserved.
 */

type PinnedListProps = {
  groupId: number;
  width: number;
  height: number;
};

type PinnedListViewProps = {
  totalCount: number;
  ids: number[];
};

export { PinnedListProps, PinnedListViewProps };
