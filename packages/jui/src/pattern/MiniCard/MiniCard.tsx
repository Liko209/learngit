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

import { StyledMiniCard } from './StyledMiniCard';

type JuiMiniCardProps = {
  children: JSX.Element[];
};

class JuiMiniCard extends PureComponent<JuiMiniCardProps> {
  constructor(props: JuiMiniCardProps) {
    super(props);
  }

  render() {
    const { children, ...rest } = this.props;
    return <StyledMiniCard {...rest}>{children}</StyledMiniCard>;
  }
}

export { JuiMiniCard, JuiMiniCardProps };
