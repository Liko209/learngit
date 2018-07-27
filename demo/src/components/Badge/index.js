/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-07 13:51:53
 * @Last Modified by: Devin Lin (devin.lin@ringcentral.com)
 * @Last Modified time: 2018-06-29 16:22:38
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const BadgeStyles = styled.b`
  position: absolute;
  top: 4px;
  right: 5px;
  width: 26px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.isMention ? '#f80' : '#4e95b6')};
  color: #fff;
  border-radius: 3px;
  opacity: ${props => (props.isShow ? 1 : 0)};
  font-size: 11px;
  font-weight: 700;
`;

const Badge = props => (
  <BadgeStyles
      isShow={props.unread_count}
      isMention={props.unread_mentions_count}
  >
    {props.unread_count}
  </BadgeStyles>
);

Badge.propTypes = {
  unread_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  unread_mentions_count: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

export default Badge;
