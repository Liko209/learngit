/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import Popper, { PopperProps } from '@material-ui/core/Popper';
// import Typography from '@material-ui/core/Typography';
// import Paper from '@material-ui/core/Paper';

type JuiMiniCardProps = {} & PopperProps;

type MiniCardFunction = (
  id: number,
) => {
  destroy: () => void;
};

class JuiMiniCard extends PureComponent<JuiMiniCardProps> {
  static profile: MiniCardFunction;

  constructor(props: JuiMiniCardProps) {
    super(props);
  }
  render() {
    const { open, anchorEl } = this.props;
    return (
      <Popper open={open} anchorEl={anchorEl}>
        <div>The content of the Popper.</div>
      </Popper>
    );
  }
}

export { JuiMiniCard, JuiMiniCardProps };
