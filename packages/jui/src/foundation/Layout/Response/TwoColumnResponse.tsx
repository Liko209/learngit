/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:47:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ReactNode } from 'react';
import JuiResponse from './Response';
import JuiHorizonPanel from './HorizonPanel';

type Props = {
  children: ReactNode[];
};

type States = {};

class JuiTwoColumnResponse extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { children } = this.props;
    return (
      <JuiResponse>
        <JuiHorizonPanel width={400}>
          {children[0]}
        </JuiHorizonPanel>
        <JuiHorizonPanel width={400}>
          {children[1]}
        </JuiHorizonPanel>
      </JuiResponse>
    );
  }
}

export { JuiTwoColumnResponse };
