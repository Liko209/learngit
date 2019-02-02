/*
 * @Author: isaac.liu
 * @Date: 2019-02-01 08:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import PostModel from '@/store/models/Post';
import { JuiPinnedItemProps } from 'jui/pattern/RightShelf/PinnedItem';

type PinnedItemProps = {
  id: number;
};

type PinnedItemViewProps = {
  post: PostModel;
  creatorName: string;
  createTime: string;
  textContent: string;
  items: JuiPinnedItemProps[];
};

export { PinnedItemProps, PinnedItemViewProps };
