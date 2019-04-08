/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 16:19:58
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ContentSearchResultViewProps } from './types';
import { JuiFullSearch, JuiTabPageEmptyScreen } from 'jui/pattern/GlobalSearch';
import {
  JuiFullSearchWrapper,
  JuiFullSearchResultWrapper,
  JuiFullSearchResultStreamWrapper,
} from 'jui/pattern/FullSearchResult';
import { JuiListSubheader } from 'jui/components/Lists';
import { Stream as PostListStream } from '@/containers/PostListPage/Stream';
import { TypeDictionary } from 'sdk/utils';
import { SearchFilter } from '@/modules/GlobalSearch/container/SearchFilter';

type Props = ContentSearchResultViewProps & WithTranslation;

@observer
class ContentSearchResultViewComponent extends Component<Props> {
  private _stream: RefObject<any> = createRef();

  componentDidMount() {
    if (this._stream && this._stream.current) {
      this.props.setStreamVM(this._stream);
    }
  }

  componentWillUnmount() {
    this.props.onSearchEnd();
  }
  render() {
    const {
      t,
      searchState,
      onPostsFetch,
      setSearchOptions,
      searchOptions,
      isEmpty,
    } = this.props;
    const contentsCount =
      searchState.contentsCount[TypeDictionary.TYPE_ID_POST] || 0;

    if (isEmpty) {
      return (
        <JuiFullSearch>
          <JuiListSubheader data-test-automation-id="searchResultsCount">
            {t('globalSearch.Results', { count: 0 })}
          </JuiListSubheader>
          <JuiTabPageEmptyScreen text={t('globalSearch.NoMatchesFound')} />
        </JuiFullSearch>
      );
    }
    return (
      <JuiFullSearchWrapper>
        <JuiFullSearchResultWrapper>
          <JuiListSubheader data-test-automation-id="searchResultsCount">
            {t('globalSearch.Results', { count: contentsCount })}
          </JuiListSubheader>
          <JuiFullSearchResultStreamWrapper>
            <PostListStream
              ref={this._stream}
              postIds={searchState.postIds}
              postFetcher={onPostsFetch}
              selfProvide={true}
            />
          </JuiFullSearchResultStreamWrapper>
        </JuiFullSearchResultWrapper>
        <SearchFilter
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          options={searchOptions}
          contentsCount={searchState.contentsCount}
        />
      </JuiFullSearchWrapper>
    );
  }
}

const ContentSearchResultView = withTranslation('translations')(
  ContentSearchResultViewComponent,
);

export { ContentSearchResultView };
