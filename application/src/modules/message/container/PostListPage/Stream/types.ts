/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 09:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { createContext } from 'react';
import { Post } from 'sdk/module/post/entity';
import { ISortableModelWithData } from '@/store/base/fetch/types';
import { QUERY_DIRECTION } from 'sdk/dao';
import PostModel from '@/store/models/Post';
import { POST_LIST_TYPE } from '../types';

type StreamProps = {
  selfProvide?: boolean; // should be true if postIds are provided by the postFetcher
  postIds: number[];
  type?: POST_LIST_TYPE;
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
  fetchInitialPosts: () => Promise<void>;
  fetchNextPagePosts: () => Promise<void>;
  shouldShowErrorPage: boolean;
  tryAgain: () => void;
};

type SuccinctPost = {
  id: number;
  deactivated?: boolean;
};

type StreamContextInfo = {
  isShow: boolean;
};

const StreamContext = createContext<StreamContextInfo>({ isShow: true });

export {
  StreamProps, StreamViewProps, SuccinctPost, StreamContext,
};
