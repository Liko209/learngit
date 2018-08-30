/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:11:48
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import SearchPageWrapper from './SearchPageWrapper';
import FullSearch from './FullSearchHeader';
import SearchContent from './SearchContent';
import queryString from 'qs';
import { service } from 'sdk';

import storeManager, { ENTITY_NAME } from '#/store';
import ChatView from 'react-chatview';
import styled from 'styled-components';

export const SearchStatus = {
  Initial: 0,
  Pending: 1,
  Success: 2,
  End: 3,
  NoResults: 4
};

const { SearchService, notificationCenter, SERVICE } = service;

@withRouter
class Search extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.initListener();
    this.initStore();
    this.state = {
      postIds: [],
      currentPageNum: 0,
      searchStatus: SearchStatus.Initial
    };
  }

  componentDidMount() {
    this.searchService = SearchService.getInstance();
    const query = this.props.history.location.search;
    const qs = queryString.parse(query).query;
    if (queryString) {
      this.setState({ searchStatus: SearchStatus.Pending });
      this.search(qs);
    }
  }

  UNSAFE_componentWillReceiveProps(nextprops) {
    this.reset();
    const query = nextprops.history.location.search;
    const qs = queryString.parse(query).query;
    this.search(qs);
  }

  search(query) {
    this.searchService.search({
      type: 'all',
      scroll_size: 50,
      queryString: query
    });
  }

  initStore() {
    this.postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST);
  }

  initListener() {
    notificationCenter.on(SERVICE.SEARCH_SUCCESS, this.onResultUpdated);
    notificationCenter.on(SERVICE.SEARCH_END, this.onSearchEnd);
  }

  onSearchEnd = () => {
    if (this.state.postIds.length === 0) {
      return this.setState({ searchStatus: SearchStatus.NoResults });
    }
    this.setState({ searchStatus: SearchStatus.End });
  };

  onSearchHandler = query => {
    this.search(query);
    this.props.history.push(`/search?query=${encodeURIComponent(query)}`);
  };

  reset() {
    this.setState({
      postIds: [],
      searchStatus: SearchStatus.Initial,
      currentPageNum: 0
    });
  }

  onResultUpdated = posts => {
    const postIds = [...new Set(posts.map(i => i.id))];
    this.postStore.batchSet(posts);
    this.setState(state => {
      return {
        postIds: [...state.postIds, ...postIds],
        searchStatus: SearchStatus.Success
      };
    });
  };

  loadMore = async () => {
    if (this.searchStatus === SearchStatus.Pending) {
      return;
    }
    const nextPageNum = this.state.currentPageNum + 1;

    this.setState({
      currentPageNum: nextPageNum,
      searchStatus: SearchStatus.Pending
    });

    try {
      await this.searchService.fetchResultsByPage({ pageNum: nextPageNum });
    } catch (error) {
      console.trace(error);
    }
  };

  componentWillUnmount() {
    this.dispose();
  }

  dispose() {
    notificationCenter.removeListener(
      SERVICE.SEARCH_SUCCESS,
      this.onResultUpdated
    );
    notificationCenter.removeListener(SERVICE.SEARCH_END, this.onSearchEnd);
  }

  shouldTriggerLoad = () => {
    const searchStatus = this.state.searchStatus;
    return (
      searchStatus !== SearchStatus.End &&
      searchStatus !== SearchStatus.NoResults
    );
  };

  render() {
    const { className, history } = this.props;
    const query = queryString.parse(history.location.search).query;
    const { postIds, searchStatus } = this.state;
    return (
      <SearchPageWrapper className={className}>
        <ChatView
          className="chatview"
          scrollLoadThreshold={400}
          shouldTriggerLoad={this.shouldTriggerLoad}
          onInfiniteLoad={this.loadMore}
        >
          <FullSearch query={query} onSearch={this.onSearchHandler} />
          <SearchContent postIds={postIds} query={query} />
          {searchStatus === SearchStatus.NoResults && <div>No results</div>}
        </ChatView>
      </SearchPageWrapper>
    );
  }
}

export default styled(Search)`
  .chatview {
    height: 100%;
    padding: 25px;
  }
`;
