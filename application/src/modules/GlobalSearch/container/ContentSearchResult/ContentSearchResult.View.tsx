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
import { SearchHighlightContext } from '@/common/postParser';
import { USED_HEIGHT, MIN_DIALOG_HEIGHT, MIN_HEIGHT_FIX } from './constants';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';

type Props = ContentSearchResultViewProps &
  WithTranslation & { isShow: boolean };

@observer
class ContentSearchResultViewComponent extends Component<Props> {
  componentWillUnmount() {
    this.props.onSearchEnd();
  }
  state = { width: 0, height: 0 };
  handleSizeChanged = (size: Size) => {
    let height = size.height - USED_HEIGHT;
    height = size.height < MIN_DIALOG_HEIGHT ? MIN_HEIGHT_FIX : height;
    this.setState({ height, width: size.width });
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
    const { height } = this.state;
    return (
      <ConversationPageContext.Provider
        value={{ height, disableMoreAction: true }}
      >
        <JuiFullSearchWrapper>
          <JuiSizeDetector handleSizeChanged={this.handleSizeChanged} />
          <JuiFullSearchResultWrapper>
            {showResult && searchState.requestId ? (
              <JuiListSubheader data-test-automation-id="searchResultsCount">
                {t('globalSearch.Results', { count: postsCount })}
              </JuiListSubheader>
            ) : null}
            {isEmpty ? (
              <JuiTabPageEmptyScreen text={t('globalSearch.NoMatchesFound')} />
            ) : (
              <JuiFullSearchResultStreamWrapper height={height}>
                {showResult && (
                  <SearchHighlightContext.Provider
                    value={{ keyword: searchKey }}
                  >
                    <PostListStream
                      isShow={isShow}
                      postIds={searchState.postIds}
                      postFetcher={onPostsFetch}
                      selfProvide={true}
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
