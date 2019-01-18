/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';

type JuiTabProps = {
  title: JSX.Element | string;
  children: React.ReactNode | string; // Container
  automationId: string;
};

class JuiTab extends PureComponent<JuiTabProps> {
  constructor(props: JuiTabProps) {
    super(props);
  }

  render() {
    const { children } = this.props;
    return { children };
  }
}

export { JuiTab, JuiTabProps };
