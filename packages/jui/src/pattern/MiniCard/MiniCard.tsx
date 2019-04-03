/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import { StyledMiniCard } from './StyledMiniCard';

type JuiMiniCardProps = {
  children: JSX.Element[];
};

class JuiMiniCard extends PureComponent<JuiMiniCardProps> {
  private _ref: React.RefObject<any>;

  constructor(props: JuiMiniCardProps) {
    super(props);
    this._ref = React.createRef();
  }

  componentDidMount() {
    this._ref.current.focus();
  }

  render() {
    const { children, ...rest } = this.props;
    return (
      <StyledMiniCard {...rest} tabIndex={0} ref={this._ref}>
        {children}
      </StyledMiniCard>
    );
  }
}

export { JuiMiniCard, JuiMiniCardProps };
