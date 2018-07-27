/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-05 16:44:43
 * @Last Modified by: Nello Huang (nello.huang@ringcentral.com)
 * @Last Modified time: 2018-03-06 10:21:34
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Text = styled.p`
  color: #333;
  font-size: 12px;
  padding: 2px 0;
  margin: 0;
  white-space: pre-wrap;
`;

const Description = ({ content }) => <Text>{content}</Text>;

Description.propTypes = {
  content: PropTypes.string.isRequired,
};

export default Description;
