/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type BookmarkProps = {
  id: number; // post id
};

type BookmarkViewProps = {
  isBookmark: boolean;
  bookmark: (bookmark: boolean) => Promise<void>;
};

export { BookmarkProps, BookmarkViewProps };
