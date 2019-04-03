/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-02 10:45:35,
 * Copyright © RingCentral. All rights reserved.
 */
import { ContentSearchParams } from 'sdk/api/glip/search';
import { Post } from 'sdk/module/post/entity';

type ContentSearchId = number | null;

type ContentSearchState = {
  requestId: ContentSearchId;
  postIds: number[];
  postCount: number;
};

type ContentSearchResult = {
  data: Post[];
  hasMore: boolean;
};

type ContentSearchOptions = {
  [Key in keyof ContentSearchParams]: ContentSearchParams[Key] | null
};

type ContentSearchResultProps = {};

type ContentSearchResultViewProps = {
  searchState: ContentSearchState;
  searchOptions: ContentSearchOptions;
  setSearchOptions(searchOptions: ContentSearchOptions): void;
  onPostsFetch(): Promise<ContentSearchResult>;
  onSearchEnd(): Promise<void>;
};

export {
  ContentSearchResultProps,
  ContentSearchResultViewProps,
  ContentSearchId,
  ContentSearchState,
  ContentSearchOptions,
};
