/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '@/store/models/Post';

type PinnedItemProps = {
  id: number;
};

type PinnedItemViewProps = {
  post: PostModel;
};

export { PinnedItemProps, PinnedItemViewProps };
