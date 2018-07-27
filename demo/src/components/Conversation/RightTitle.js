/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-05 16:03:03
 * @Last Modified by: Devin Lin (devin.lin@ringcentral.com)
 * @Last Modified time: 2018-06-29 17:10:01
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  color: #8892a5;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: proxima-nova4 !important;
  h4 {
    margin: 0;
    padding: 10px 0 0;
  }
`;

const RightTitle = ({ title }) => (
  <Wrapper>
    <h4>{title}</h4>
  </Wrapper>
);

RightTitle.propTypes = {
  title: PropTypes.string.isRequired
};

export default RightTitle;
