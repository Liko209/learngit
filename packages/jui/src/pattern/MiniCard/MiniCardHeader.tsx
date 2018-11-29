/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import { StyledMiniCardHeader } from './StyledMiniCardHeader';

type JuiMiniCardHeaderProps = {
  emphasize?: boolean;
  children: any;
};

class JuiMiniCardHeader extends PureComponent<JuiMiniCardHeaderProps> {
  constructor(props: JuiMiniCardHeaderProps) {
    super(props);
  }
  render() {
    const { emphasize, children } = this.props;
    return (
      <StyledMiniCardHeader emphasize={emphasize}>
        {children}
      </StyledMiniCardHeader>
    );
  }
}

export { JuiMiniCardHeader };
