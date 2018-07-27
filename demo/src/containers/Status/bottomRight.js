/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-05-30 14:44:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { gitCommitInfo } from './commitInfo';
import { formatDate } from './LoginVersionStatus';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  right: 10px;
  bottom: 0px;
  font-size: 13px;
  width: 200px;
  padding: 10px;
`;

class BottomRightVersionStatus extends Component {
  constructor(props) {
    super(props);
    this.commitInfo = gitCommitInfo || {
      currentBranch: '',
      commitInfo: []
    };
  }

  render() {
    let result = 'Version: ';
    let version = process.env.APP_VERSION || '';
    if (version !== '') {
      if (gitCommitInfo.commitInfo && gitCommitInfo.commitInfo.length) {
        result += `${version}.${gitCommitInfo.commitInfo[0].commitHash}`;
      } else {
        result += `${version}`;
      }
    }
    const time = `Build: ${formatDate(process.env.BUILD_TIME)}`;

    return (
      <Wrapper>
        <div>{result}</div>
        <div>{time}</div>
      </Wrapper>
    );
  }
}

export default BottomRightVersionStatus;
