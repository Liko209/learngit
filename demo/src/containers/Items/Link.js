/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 09:56:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';

const Wrapper = styled.div`
  font-size: 14px;
  word-wrap: break-word;
  border: 1px solid transparent;
  margin-top: 15px;
  padding: 7px;
  border-radius: 8px;
  &.fn-hide {
    display: none;
  }
  .title {
    font-weight: 700;
    font-size: 14px;
    color: #0c5483 !important;
    cursor: pointer;
    margin-bottom: 3px;
    :hover {
      text-decoration: underline;
    }
    .link-icon {
      display: inline-block;
      color: rgb(153, 153, 153);
    }

    .link-href {
      color: rgb(12, 84, 131);
      text-decoration: none;
      padding-left: 1%;
    }
  }
  :hover {
    border-color: #e9e9e9;
  }

  .link-img {
    float: left;
    width: 30%;
    margin-left: 7%;
  }

  .link-summary {
    float: left;
    width: 60%;
    font-size: 12px;
    color: #333;
  }
`;

const Link = props => {
  const { do_not_render, title, summary, data = {}} = props;
  if (!title && !summary) {
    return null;
  }
  const linkImg = data.images && data.images[0];
  return (
    <Wrapper className={do_not_render ? 'fn-hide' : ''}>
      {title && (
        <div className="title">
          <span className="link-icon">[Link]</span>
          <a target="_target" className="link-href" href={data.url}>
            {title}
          </a>
        </div>
      )}
      {summary && <div className="link-summary">{summary}</div>}
      {linkImg && <img className="link-img" src={linkImg.url} />}
    </Wrapper>
  );
};

Link.propTypes = {
  // url: PropTypes.string,
  title: PropTypes.string,
  summary: PropTypes.string,
  data: PropTypes.object
};

Link.defaultProps = {
  title: '',
  summary: '',
  data: {}
};

export default observer(props => {
  const { id } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const itemLink = itemStore.get(id);
  return <Link {...itemLink} />;
});
