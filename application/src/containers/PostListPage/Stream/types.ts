/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 09:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { LoadingMorePlugin } from '@/plugins';
import { Post } from 'sdk/module/post/entity';
import { ISortableModel } from '@/store/base/fetch/types';
import { QUERY_DIRECTION } from 'sdk/dao';
import PostModel from '@/store/models/Post';

type StreamProps = {
  selfProvide?: boolean; // should be true if postIds are provided by the postFetcher
  postIds: number[];
  postFetcher: (
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel<Post>,
  ) => Promise<{
    hasMore: boolean;
    data: (Post | PostModel)[];
  }>;
};

type StreamViewProps = {
  ids: number[];
  hasMore: boolean;
  plugins: TPluginsProps;
  fetchInitialPosts: () => void;
};

type TPluginsProps = {
  loadingMorePlugin: LoadingMorePlugin;
};
type SuccinctPost = {
  id: number;
  deactivated?: boolean;
};

export { StreamProps, StreamViewProps, SuccinctPost };
