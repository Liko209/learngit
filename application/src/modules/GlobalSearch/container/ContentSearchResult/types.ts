/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-02 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { ContentSearchParams } from 'sdk/api/glip/search';
import { Post } from 'sdk/module/post/entity';

type ContentSearchState = {
  requestId: number | null;
  postIds: number[];
  contentsCount: {
    [key: number]: number;
  };
};

type ContentSearchResult = {
  data: Post[];
  hasMore: boolean;
};

type ContentSearchOptions = {
  [Key in keyof ContentSearchParams]: ContentSearchParams[Key] | null
};

type ContentSearchResultProps = {
  pageDataTracking?: Function;
};

type ContentSearchResultViewProps = {
  showResult: boolean;
  postsCount?: number;
  isEmpty: boolean;
  searchState: ContentSearchState;
  searchOptions: ContentSearchOptions;
  searchKey: string;
  setSearchOptions(searchOptions: ContentSearchOptions): void;
  onPostsFetch(): Promise<ContentSearchResult>;
  onSearchEnd(): Promise<void>;
};

const CONTENT_SEARCH_FETCH_COUNT: number = 20;

export {
  ContentSearchResultProps,
  ContentSearchResultViewProps,
  ContentSearchState,
  ContentSearchOptions,
  CONTENT_SEARCH_FETCH_COUNT,
};
