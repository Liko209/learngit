/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
// import Popper, { PopperProps } from '@material-ui/core/Popper';

// import Typography from '@material-ui/core/Typography';
// import Paper from '@material-ui/core/Paper';
// import { JuiPopper, JuiPopperProps } from '../../components/Popper';

import { StyledWrapper } from './StyledWrapper';

type JuiMiniCardProps = {
  anchor: HTMLElement;
  children: JSX.Element[];
};

class JuiMiniCard extends PureComponent<JuiMiniCardProps> {
  constructor(props: JuiMiniCardProps) {
    super(props);
  }
  render() {
    const { anchor, children } = this.props;
    const rect = anchor.getBoundingClientRect();
    const { left, top } = rect;
    return (
      <StyledWrapper left={left} top={top}>
        {children}
        <div>The content of the Popper.</div>
      </StyledWrapper>
    );
  }
}

export { JuiMiniCard, JuiMiniCardProps };
