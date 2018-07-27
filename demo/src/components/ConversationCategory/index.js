/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-13 16:11:54
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 35px;
  padding: 5px 10px 5px 5px;
  border-radius: 3px;
  font-size: 13px;
  font-family: proxima-nova4 !important;
  color: #eee;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StyledLink = styled(NavLink)`
  color: #fff;
  text-decoration: none;
  &.active > div {
    color: #000;
    background: white;
  }
`;

const Icon = styled.i`
  font-size: 14px;
  margin: 0 5px 0 0;
`;

const CreateTeam = styled.span`
  font-size: 16px;
  height: 16px;
  width: 16px;
  line-height: 16px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  border-radius: 50%;
  border: 2px solid #fff;
`;

const Text = styled.span`
  display: block;
  width: 100%;
  font-weight: bold;
  text-transform: capitalize;
`;

const TYPE_CLASS = {
  people: 'iconfont icon-user-full',
  teams: 'iconfont icon-team-full',
  favorites: 'iconfont icon-star-full'
};

const ConversationCategory = ({ to, type, text, handleOpenModal }) => {
  let Content = (
    <React.Fragment>
      <Icon className={TYPE_CLASS[type]} />
      <Text>{text}</Text>
    </React.Fragment>
  );
  if (to !== '/') {
    return (
      <StyledLink to={to}>
        <Wrapper>{Content}</Wrapper>
      </StyledLink>
    );
  } else {
    return (
      <Wrapper>
        {Content}
        {type === 'teams' && (
          <CreateTeam onClick={handleOpenModal}>+</CreateTeam>
        )}
      </Wrapper>
    );
  }
};

ConversationCategory.propTypes = {
  to: PropTypes.string,
  text: PropTypes.string.isRequired,
  type: PropTypes.string
};

ConversationCategory.defaultProps = {
  to: '/',
  type: PropTypes.string,
  handleOpenModal: PropTypes.func
};

export default ConversationCategory;
