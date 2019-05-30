/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 09:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { createContext } from 'react';
import { LoadingMorePlugin } from '@/plugins';
import { Post } from 'sdk/module/post/entity';
import { ISortableModelWithData } from '@/store/base/fetch/types';
import { QUERY_DIRECTION } from 'sdk/dao';
import PostModel from '@/store/models/Post';

type StreamProps = {
  selfProvide?: boolean; // should be true if postIds are provided by the postFetcher
  postIds: number[];
  isShow?: boolean;
  postFetcher: (
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModelWithData<Post>,
  ) => Promise<{
    hasMore: boolean;
    data: (Post | PostModel)[];
  }>;
};

type StreamViewProps = {
  ids: number[];
  hasMoreDown: boolean;
  plugins: TPluginsProps;
  fetchInitialPosts: () => Promise<void>;
  fetchNextPagePosts: () => Promise<void>;
};

type TPluginsProps = {
  loadingMorePlugin: LoadingMorePlugin;
};
type SuccinctPost = {
  id: number;
  deactivated?: boolean;
};

type StreamContextInfo = {
  isShow: boolean;
};

const StreamContext = createContext<StreamContextInfo>({ isShow: true });

export { StreamProps, StreamViewProps, SuccinctPost, StreamContext };
