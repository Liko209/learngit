/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-15 09:51:58
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PostService from 'sdk/service/post';
// import UploadManager from 'sdk/service/base/UploadManager';

const Wrapper = styled.div`
  border-bottom: 1px solid #ddd;
`;

const FileUpload = styled.input`
  height: 20px;
  font-size: 12px;
  color: transparent;
`;

class Toolbar extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };
  constructor() {
    super();
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }
  // Get upload gropress
  // componentWillMount() {
  // UploadManager.on(this.props.id, (event) => {
  //   console.log(event, '------will');
  // });
  // }
  handleFileUpload(event) {
    const data = new FormData();
    const service = PostService.getInstance();
    const { files } = event.target;

    Object.keys(files).forEach(item => {
      data.append('file', files[item]);
    });

    service.sendItemFile({
      groupId: Number(this.props.id),
      file: data
    });
  }

  render() {
    return (
      <Wrapper>
        <FileUpload type="file" onChange={this.handleFileUpload} />
      </Wrapper>
    );
  }
}

export default Toolbar;
