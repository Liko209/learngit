/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-04-02 08:55:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { gitCommitInfo } from './commitInfo';
import { formatDate } from './helper';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 30px;
`;

class VersionInfo extends Component {
  private commitInfo: { currentBranch: string; commitInfo: any[] };
  constructor(props: any) {
    super(props);
    this.commitInfo = gitCommitInfo || {
      currentBranch: '',
      commitInfo: [],
    };
  }

  render() {
    let result = `<h2>Current Branch : ${this.commitInfo.currentBranch}</h2>`;
    for (let i = 0; i < this.commitInfo.commitInfo.length; i += 1) {
      const commit = this.commitInfo.commitInfo[i];
      const keys = Object.keys(commit);
      result += '<ul>';
      for (let j = 0; j < keys.length; j += 1) {
        const key = keys[j];
        if (key === 'commitHash') {
          result += `<li style="color:DodgerBlue">${key}:   ${
            commit[key]
          }</li>`;
        } else {
          result += `<li>${key}:   ${commit[key]}</li>`;
        }
      }
      result += '</ul>';
    }
    let versionInfo = 'Current Version: ';
    const version = process.env.APP_VERSION || '';
    if (version !== '') {
      if (gitCommitInfo.commitInfo && gitCommitInfo.commitInfo.length) {
        versionInfo += `${version}.${gitCommitInfo.commitInfo[0].commitHash}`;
      } else {
        versionInfo += `${version}`;
      }
    }
    const buildTime = `Build Time: ${formatDate(process.env.BUILD_TIME || '')}`;
    return (
      <Wrapper>
        <div dangerouslySetInnerHTML={{ __html: result }} />{' '}
        <h3>{versionInfo}</h3>
        <h3>{buildTime}</h3>
      </Wrapper>
    ); // eslint-disable-line react/no-danger
  }
}

export { VersionInfo };
