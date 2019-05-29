/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:36
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';
import { Post } from 'sdk/module/post/entity';
import { ISortableModelWithData } from '@/store/base/fetch/types';
import { QUERY_DIRECTION } from 'sdk/dao';
import PostModel from '@/store/models/Post';

enum POST_LIST_TYPE {
  mentions = 'mentions',
  bookmarks = 'bookmarks',
}

type PostListPageViewProps = WithTranslation & {
  kind: POST_LIST_TYPE;
  caption: string;
  ids: number[];
  unsetCurrentPostListValue: Function;
  postFetcher: (
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModelWithData<Post>,
  ) => Promise<{
    hasMore: boolean;
    data: (Post | PostModel)[];
  }>;
};

type PostListPageProps = {
  type: string;
};

export { PostListPageProps, PostListPageViewProps, POST_LIST_TYPE };
