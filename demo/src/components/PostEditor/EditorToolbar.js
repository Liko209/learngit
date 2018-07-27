/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-04-11 15:09:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import LoadingIndicator from '../LoadingIndicator';

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  background: #0570a1;
  border: 1px solid #0570a1;
  border-radius: 4px;
  padding: 2px 8px;
  margin: 0 5px;
  overflow: hidden;
  font-size: 14px;
  color: #fff;
  text-decoration: none;
  text-indent: 0;
  line-height: 20px;
`;

const FileUpload = styled.input`
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
`;

// const Text = styled.span`
//   opacity: ${props => (props.visiable ? 1 : 0)};
// `;

const EditorToolbar = props => {
  return (
    <div>
      <Wrapper>
        upload
        <FileUpload
            type="file"
            onChange={props.handleFileUpload}
            disabled={props.uploadLoading}
        />
      </Wrapper>
      {window.fijiElectron && (
        <Wrapper
            data-screenshot="screenshot"
            onClick={props.handleScreenshot}
            disabled={props.uploadLoading}
        >
          screenshot
        </Wrapper>
      )}
      {props.uploadLoading && (
        <LoadingIndicator
            style={{
              margin: '5px auto',
              width: '25px',
              height: '25px',
              position: 'relative'
            }}
        />
      )}
    </div>
  );
};

EditorToolbar.propTypes = {
  handleFileUpload: PropTypes.func.isRequired,
  handleScreenshot: PropTypes.func,
  uploadLoading: PropTypes.bool.isRequired
};

export default EditorToolbar;
