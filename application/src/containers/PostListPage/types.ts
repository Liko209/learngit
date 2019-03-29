/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:36
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';
enum POST_LIST_TYPE {
  mentions = 'mentions',
  bookmarks = 'bookmarks',
}

type PostListPageViewProps = WithTranslation & {
  type: POST_LIST_TYPE;
  caption: string;
  ids: number[];
  unsetCurrentPostListValue: Function;
};

type PostListPageProps = {
  type: string;
};

export { PostListPageProps, PostListPageViewProps, POST_LIST_TYPE };
