/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-17 09:31:11
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiPopper } from '../../components/Popper';
import styled from '../../foundation/styled-components';
import { ClickAwayListener, Paper, Grow } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';

type PopperMenuProps = {
  children: React.ReactNode;
  Anchor: React.SFC<{}>;
  automationId?: string;
  transformOrigin?: string;
  placement?: PopperPlacementType;
  setMoreItemState?: (value: boolean) => void;
  open: boolean;
};

const StyledAnchorWrapper = styled.div`
  display: inline-flex;
`;

class JuiPopperMenu extends React.Component<
  PopperMenuProps,
  { anchorEl: HTMLElement | null }
> {
  constructor(props: PopperMenuProps) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    const { currentTarget } = event;
    this.setState({
      anchorEl: currentTarget,
    });
  }

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  }

  render() {
    const { anchorEl } = this.state;
    // const open = Boolean(anchorEl);
    const {
      Anchor,
      children,
      automationId,
      transformOrigin,
      placement,
      open,
    } = this.props;
    const id = open ? 'popper-menu' : '';
    return (
      <>
        <StyledAnchorWrapper onClick={this.handleToggle}>
          <Anchor aria-describedby={id} />
        </StyledAnchorWrapper>
        <JuiPopper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement={placement}
          data-test-automation-id={automationId}
          transition={true}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: transformOrigin || 'center top',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  {children}
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </JuiPopper>
      </>
    );
  }
}

export { JuiPopperMenu, PopperMenuProps };
