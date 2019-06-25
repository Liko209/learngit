/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-17 09:31:11
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiPopper } from '../../components/Popper';
import { ClickAwayListener, Paper, Grow } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';

type AnchorProps = {
  tooltipForceHide: boolean;
};

type JuiPopperMenuProps = {
  children: React.ReactNode;
  Anchor: React.SFC<AnchorProps>;
  anchorEl: EventTarget & Element | null;
  automationId?: string;
  transformOrigin?: string;
  placement?: PopperPlacementType;
  setMoreItemState?: (value: boolean) => void;
  open: boolean;
  value?: number;
  noTransition?: boolean;
  onClose: (event?: React.ChangeEvent<{}>) => void;
  disablePortal?: boolean;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
};

class JuiPopperMenu extends React.PureComponent<JuiPopperMenuProps> {
  stopRippleEffect(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.stopPropagation();
  }

  render() {
    const {
      Anchor,
      children,
      automationId,
      transformOrigin,
      placement,
      open,
      noTransition,
      anchorEl,
      onClose,
      disablePortal,
      onMouseEnter,
      onMouseLeave,
    } = this.props;
    const id = open ? 'popper-menu' : '';
    return (
      <ClickAwayListener onClickAway={onClose}>
        {/*
       ClickAwayListener only finds the first child
       so must be use div include Anchor and JuiPopper
      https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/ClickAwayListener/ClickAwayListener.js#L19-L22 */}
        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <span onMouseDown={this.stopRippleEffect}>
            <Anchor aria-describedby={id} tooltipForceHide={open} />
          </span>
          <JuiPopper
            id={id}
            open={open}
            anchorEl={anchorEl}
            placement={placement}
            data-test-automation-id={automationId}
            transition={true}
            disablePortal={disablePortal}
            modifiers={{
              flip: {
                enabled: true,
              },
              preventOverflow: {
                enabled: true,
                boundariesElement: 'viewport',
              },
            }}
          >
            {({ TransitionProps }) => {
              return (
                <Grow
                  {...TransitionProps}
                  timeout={noTransition ? 0 : 'auto'}
                  style={{
                    transformOrigin: transformOrigin || 'center top',
                  }}
                >
                  <Paper>{children}</Paper>
                </Grow>
              );
            }}
          </JuiPopper>
        </div>
      </ClickAwayListener>
    );
  }
}

export { JuiPopperMenu, JuiPopperMenuProps, AnchorProps };
