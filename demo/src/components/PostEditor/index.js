/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-11 14:57:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Toolbar from './EditorToolbar';

const Wrapper = styled.footer`
  flex-basis: 70px;
  align-items: flex-end;
  margin: 0;
  border: 1px solid #e9e9e9;
  background-color: #fff;
  color: #333;
`;
const Textarea = styled.textarea`
  width: 100%;
  height: 50px;
  border: none;
`;

const PostEditor = props => (
  <Wrapper>
    <Toolbar
        handleFileUpload={props.handleFileUpload}
        handleScreenshot={props.handleScreenshot}
    />
    <Textarea
        placeholder="Input your message and press enter..."
        value={props.text}
        onCompositionStart={props.handleComposition}
        onCompositionEnd={props.handleComposition}
        onChange={props.onInputChange}
        onKeyDown={props.onEnterPress}
    />
  </Wrapper>
);

PostEditor.propTypes = {
  handleFileUpload: PropTypes.func.isRequired,
  handleScreenshot: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  handleComposition: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onEnterPress: PropTypes.func.isRequired
};

export default PostEditor;
