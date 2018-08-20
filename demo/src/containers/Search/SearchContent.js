/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:11:44
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
// import { observer } from 'mobx-react';
import styled from 'styled-components';

import Post from '#/containers/Post';
import highlight from './Highlight';

class FullSearchResults extends Component {
  render() {
    const { postIds, query } = this.props;
    const HighlightPost = highlight({ query, component: Post });
    return (
      <div className={this.props.className}>
        <div className="search_category">Content</div>
        {postIds.map(pid => (
          <HighlightPost
              className="post"
              id={pid}
              key={pid}
              hideAction={true}
          />
        ))}
      </div>
    );
  }
}
export default styled(FullSearchResults)`
  .search_category {
    color: #666;
    padding: 20px 0 5px;
    font-size: 16px;
    font-weight: 400;
    margin: 20px 0 10px;
    text-transform: capitalize;
    border-bottom: 1px solid #eee;
    cursor: text;
  }
  .post {
    cursor:pointer
    border: transparent;
    border-bottom: 1px solid #eee;
  }
  .post:hover {
    background-color: #f6f6f6;
  }
`;
