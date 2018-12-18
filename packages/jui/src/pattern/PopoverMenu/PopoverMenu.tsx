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
};

const StyledAnchorWrapper = styled.div`
  display: inline-flex;
`;

const StyledPopoverMenuWrapper = styled.div`
  .popper-backdrop {
    position: relative;
  }
`;

class JuiPopoverMenu extends React.Component<
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
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event, '=--------------event---------');
    this.setState({
      anchorEl: null,
    });
  }

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const {
      Anchor,
      children,
      automationId,
      anchorOrigin,
      transformOrigin,
    } = this.props;
    return (
      <StyledPopoverMenuWrapper>
        <StyledAnchorWrapper onClick={this.handleToggle}>
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
      </StyledPopoverMenuWrapper>
    );
  }
}

export { JuiPopoverMenu, PopoverMenuProps };
