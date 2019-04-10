/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-02 16:19:58
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ContentSearchResultViewProps } from './types';
import {
  JuiFullSearchWrapper,
  JuiFullSearchResultWrapper,
} from 'jui/pattern/FullSearchResult';
import { toTitleCase } from '@/utils/string';
import { JuiListSubheader } from 'jui/components/Lists';
import { Stream as PostListStream } from '@/containers/PostListPage/Stream';
import { TypeDictionary } from 'sdk/utils';

type Props = ContentSearchResultViewProps & WithTranslation;

@observer
class ContentSearchResultViewComponent extends Component<Props> {
  state = {
    renderList: false,
  };
  remountStream() {
    this.setState(
      {
        renderList: false,
      },
      () => {
        this.setState({
          renderList: true,
        });
      },
    );
  }
  componentDidMount() {
    this.setState({
      renderList: true,
    });
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.searchState.requestId && !this.props.searchState.requestId) {
      this.remountStream();
    }
  }
  componentWillUnmount() {
    this.props.onSearchEnd();
  }
  render() {
    const { t, searchState, onPostsFetch } = this.props;
    return (
      <JuiFullSearchWrapper>
        <JuiFullSearchResultWrapper>
          <JuiListSubheader>
            {toTitleCase(t('result'))} (
            {searchState.contentsCount[TypeDictionary.TYPE_ID_POST]})
          </JuiListSubheader>
          {this.state.renderList ? (
            <PostListStream
              postIds={searchState.postIds}
              postFetcher={onPostsFetch}
              selfProvide={true}
            />
          ) : null}
        </JuiFullSearchResultWrapper>
        <div>filters</div>
      </JuiFullSearchWrapper>
    );
  }
}

const ContentSearchResultView = withTranslation('translations')(
  ContentSearchResultViewComponent,
);

export { ContentSearchResultView };
