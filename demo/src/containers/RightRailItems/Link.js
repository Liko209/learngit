/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 14:30:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

export const LinkItem = styled.div`
  text-overflow: ellipsis;
  border: 1px solid transparent;
  line-height: 26px;
  border-radius: 8px;
  .title {
    white-space: nowrap;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Link = props => {
  const { title, url, data } = props;
  let realUrl = url;
  if (!url.match(/^https?:\/\//)) {
    realUrl = ['http://', url].join('');
  }
  return (
    <LinkItem>
      <div className="title">
        [Link]
        <a
            target="_blank"
            className="link-href"
            href={data ? data.url : realUrl}
        >
          {title || realUrl}
        </a>
      </div>
    </LinkItem>
  );
};

export default Link;
