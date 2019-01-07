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

type States = {
  isBlur: boolean;
};

class JuiMiniCard extends PureComponent<JuiMiniCardProps, States> {
  private _ref: React.RefObject<any>;
  private _timer: number;

  constructor(props: JuiMiniCardProps) {
    super(props);
    this.state = { isBlur: false };
    this._ref = React.createRef();
  }

  componentDidMount() {
    this._ref.current.focus();
  }

  onBlurHandler = () => {
    this._timer = setTimeout(() => {
      this.setState({
        isBlur: true,
      });
    });
  }

  onFocusHandler = () => {
    clearTimeout(this._timer);
  }

  render() {
    const { isBlur } = this.state;
    if (isBlur) {
      return null;
    }
    const { children, ...rest } = this.props;
    return (
      <StyledMiniCard
        {...rest}
        tabIndex={0}
        ref={this._ref}
        onBlur={this.onBlurHandler}
        onFocus={this.onFocusHandler}
      >
        {children}
      </StyledMiniCard>
    );
  }
}

export { JuiMiniCard, JuiMiniCardProps };
