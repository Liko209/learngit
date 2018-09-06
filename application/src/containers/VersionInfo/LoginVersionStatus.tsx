/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-09-05 13:55:55
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';

import { gitCommitInfo } from './commitInfo';

const Wrapper = styled.div`
  position: absolute;
  left: 5px;
  bottom: 50px;
  width: 400px;
`;

function formatDate(date: string) {
  const d = new Date(date);
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = d.getFullYear();
  let hours = String(d.getHours());
  let mins = String(d.getMinutes());
  let seconds = String(d.getSeconds());

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hours.length < 2) hours = '0' + hours;
  if (mins.length < 2) mins = '0' + mins;
  if (seconds.length < 2) seconds = '0' + seconds;

  return [year, month, day].join('-') + ' ' + [hours, mins, seconds].join(':');
}
class LoginVersionStatus extends React.Component {
  private commitInfo: {
    currentBranch: string,
    commitInfo: any[],
  };
  constructor(props: any) {
    super(props);
    this.commitInfo = gitCommitInfo || {
      currentBranch: '',
      commitInfo: [],
    };
  }

  render() {
    let result = 'Version: ';
    const version = process.env.APP_VERSION || '';
    if (version !== '') {
      if (this.commitInfo.commitInfo && this.commitInfo.commitInfo.length) {
        result += `${version}.${this.commitInfo.commitInfo[0].commitHash}`;
      } else {
        result += `${version}`;
      }
    }
    // const env = `Environment: `;
    const time = `Build Time: ${formatDate(process.env.BUILD_TIME || '')}`;

    return (
      <Wrapper>
        <div>{result}</div>
        {/* <div>
          {env}
          <EnvSelect />
        </div> */}
        <div>{time}</div>
      </Wrapper>
    );
  }
}

export default LoginVersionStatus;
export { formatDate };
