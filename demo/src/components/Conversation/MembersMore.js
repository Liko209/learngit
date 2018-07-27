/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-05 17:02:43
 * @Last Modified by: Nello Huang (nello.huang@ringcentral.com)
 * @Last Modified time: 2018-06-25 15:22:59
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const More = styled.i`
  display: inline-block;
  width: ${props => props.width};
  height: ${props => props.height};
  line-height: ${props => props.height};
  text-align: center;
  font-size: 12px;
  border-radius: 50%;
  color: #0684bd;
  border: 1px solid rgba(6, 132, 189, 0.3);
  cursor: pointer;
  background: rgba(0, 0, 0, 0.05);
  vertical-align: top;
  &:hover {
    color: #fff;
    background: #305161;
  }
`;

const MembersMore = ({ width, height }) => (
  <More width={width} height={height}>
    More
  </More>
);

MembersMore.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string
};

MembersMore.defaultProps = {
  width: '36px',
  height: '36px'
};

export default MembersMore;
