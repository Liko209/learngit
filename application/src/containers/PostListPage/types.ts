/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 13:42:36
 * Copyright © RingCentral. All rights reserved.
 */
enum POST_LIST_TYPE {
  mentions = 'mentions',
  bookmarks = 'bookmarks',
}

type PostListPageViewProps = {
  type: POST_LIST_TYPE;
  caption: string;
  ids: number[];
};

type PostListPageProps = {
  type: string;
};

export { PostListPageProps, PostListPageViewProps, POST_LIST_TYPE };
