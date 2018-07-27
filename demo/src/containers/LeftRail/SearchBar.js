/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-20 21:29:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import { service } from 'sdk';
import { withRouter } from 'react-router';

import SearchSection from '@/containers/LeftRail/SearchSection';
import { ListSection, ListItem, Left, Right } from './style';

const { SearchService } = service
const Wrapper = styled.div`
  position: relative;
  /* display: flex; */
  /* flex-basis: 40px; */
  /* justify-content: center; */
  margin-bottom: 10px;
`;

const Mask = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  z-index: 10;
  display: ${props => (props.show ? 'block' : 'none')};
`;

const Search = styled.input`
  display: block;
  position: relative;
  width: 100%;
  border-radius: 3px;
  background: #fff;
  color: #444;
  border: 0;
  height: 35px;
  box-sizing: border-box;
  padding: 5px 10px;
  z-index: 11;
  &:focus {
    outline: 0;
  }
`;

const SearchList = styled.div`
  display: ${props => (props.show ? 'block' : 'none')};
  position: absolute;
  top: 100%;
  left: 5%;
  width: 460px;
  max-height: 400px;
  padding: 5px 0;
  overflow-y: scroll;
  overflow-x: hidden;
  background: #fff;
  box-shadow: 0 0 5px #999;
  z-index: 11;
  box-sizing: border-box;
`;

async function fetchSearch(query) {
  const searchService = SearchService.getInstance();
  const result = await searchService.searchContact(query);
  return result;
}

class SearchBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      list: {},
      isShow: false
    };
  }

  // eslint-disable-next-line
  search = debounce(async value => {
    if (!value) {
      this.setState({
        isShow: false
      });
      return;
    }
    const result = await fetchSearch(value);
    this.setState({
      list: result,
      isShow: true
    });
  }, 150);

  fetchSearchData = e => {
    const { value } = e.target;
    this.setState({
      value
    });
    this.search(value);
  };

  resetSearch = () => {
    this.setState({
      value: '',
      list: {}
    });
  };

  onBlur = () => {
    this.setState({
      isShow: false
    });
  };

  goToSearch = () => {
    this.props.history.push(`/search?query=${this.state.value}`);
    this.onBlur();
  };

  render() {
    const { list, value, isShow } = this.state;

    return (
      <Wrapper>
        <Mask onClick={this.onBlur} show={isShow} />
        <Search
          placeholder="Search"
          onFocus={this.fetchSearchData}
          onChange={this.fetchSearchData}
          value={value}
        />
        <SearchList show={isShow}>
          <ListSection>
            <ListItem onClick={this.goToSearch}>
              <Left>Content</Left>
              <Right>Search for “{value}”</Right>
            </ListItem>
          </ListSection>
          {Object.keys(list).map(key => (
            <SearchSection
              resetSearch={this.resetSearch}
              key={key}
              section={key}
              items={list[key]}
            />
          ))}
        </SearchList>
      </Wrapper>
    );
  }
}

export default withRouter(SearchBar);
