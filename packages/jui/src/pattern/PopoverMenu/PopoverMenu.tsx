/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 14:28:22
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiPopover } from '../../components/Popover';
import styled from '../../foundation/styled-components';

type PopoverMenuProps = {
  children: React.ReactNode;
  Anchor: React.SFC<{}>;
  anchorOrigin?: {
    vertical: 'bottom' | 'top' | 'center';
    horizontal: 'left' | 'center' | 'right';
  };
  transformOrigin?: {
    vertical: 'bottom' | 'top' | 'center';
    horizontal: 'left' | 'center' | 'right';
  };
  automationId?: string;
  className?: string;
  onClose?: (event: React.MouseEvent<HTMLElement>) => void;
  onOpen?: () => void;
  disabled?: boolean;
};

const StyledAnchorWrapper = styled.div`
  display: inline-flex;
  width: 100%;
`;

class JuiPopoverMenu extends React.PureComponent<
  PopoverMenuProps,
  { anchorEl: HTMLElement | null }
> {
  constructor(props: PopoverMenuProps) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    const { onOpen, disabled } = this.props;
    if (disabled) {
      return;
    }
    event.stopPropagation();
    this.setState({
      anchorEl: event.currentTarget,
    });

    onOpen && onOpen();
    return;
  };

  handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    const { onClose } = this.props;
    onClose && onClose(event);
    this.setState({
      anchorEl: null,
    });
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const {
      Anchor,
      children,
      automationId,
      anchorOrigin,
      transformOrigin,
      className,
    } = this.props;
    return (
      <div className={className}>
        <StyledAnchorWrapper
          onClick={this.handleToggle}
          onMouseDown={this.handleMouseDown}
        >
          <Anchor />
        </StyledAnchorWrapper>
        <JuiPopover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          onClick={this.handleClose}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
          data-test-automation-id={automationId}
          className="popper-backdrop"
        >
          {children}
        </JuiPopover>
      </div>
    );
  }
}

export { JuiPopoverMenu, PopoverMenuProps };
