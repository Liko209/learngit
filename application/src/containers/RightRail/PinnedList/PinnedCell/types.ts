/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '@/store/models/Post';

type PinnedCellProps = {
  id: number;
};

type PinnedCellViewProps = {
  post: PostModel;
  creatorName: string;
  createTime: string;
  textContent: string;
  itemIds: number[];
};

export { PinnedCellProps, PinnedCellViewProps };
