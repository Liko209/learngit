/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 16:19:58
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ContentSearchResultViewProps } from './types';
import { JuiTabPageEmptyScreen } from 'jui/pattern/GlobalSearch';
import {
  JuiFullSearchWrapper,
  JuiFullSearchResultWrapper,
  JuiFullSearchResultStreamWrapper,
} from 'jui/pattern/FullSearchResult';
import { JuiListSubheader } from 'jui/components/Lists';
import { Stream as PostListStream } from '@/modules/message/container/PostListPage/Stream';
import { SearchFilter } from '@/modules/GlobalSearch/container/SearchFilter';
import { ConversationPageContext } from '@/modules/message/container/ConversationPage/types';
import { SearchHighlightContext } from 'jui/hoc/withHighlight';

type Props = ContentSearchResultViewProps &
  WithTranslation & { isShow: boolean };

// Section Header + Tabs Height + Search Input + Margin
const USED_HEIGHT = 36 + 40 + 48 + 56;

@observer
class ContentSearchResultViewComponent extends Component<Props> {
  componentWillUnmount() {
    this.props.onSearchEnd();
  }

  render() {
    const {
      t,
      postsCount,
      searchState,
      onPostsFetch,
      setSearchOptions,
      searchOptions,
      isEmpty,
      isShow,
      showResult,
      searchKey,
    } = this.props;
    return (
      <ConversationPageContext.Provider value={{ disableMoreAction: true }}>
        <JuiFullSearchWrapper>
          <JuiFullSearchResultWrapper>
            {showResult && searchState.requestId ? (
              <JuiListSubheader data-test-automation-id="searchResultsCount">
                {t('globalSearch.Results', { count: postsCount })}
              </JuiListSubheader>
            ) : null}
            {isEmpty ? (
              <JuiTabPageEmptyScreen text={t('globalSearch.NoMatchesFound')} />
            ) : (
              <JuiFullSearchResultStreamWrapper>
                {showResult && (
                  <SearchHighlightContext.Provider
                    value={{ keyword: searchKey }}
                  >
                    <PostListStream
                      isShow={isShow}
                      postIds={searchState.postIds}
                      postFetcher={onPostsFetch}
                      selfProvide={true}
                      usedHeight={USED_HEIGHT}
                    />
                  </SearchHighlightContext.Provider>
                )}
              </JuiFullSearchResultStreamWrapper>
            )}
          </JuiFullSearchResultWrapper>
          <SearchFilter
            setSearchOptions={setSearchOptions}
            searchOptions={searchOptions}
            contentsCount={searchState.contentsCount}
          />
        </JuiFullSearchWrapper>
      </ConversationPageContext.Provider>
    );
  }
}

const ContentSearchResultView = withTranslation('translations')(
  ContentSearchResultViewComponent,
);

export { ContentSearchResultView };
