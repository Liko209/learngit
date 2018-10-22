/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 13:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { TowardIcons } from './TowardIcons';
import { OPERATION } from './types';
import styled from '../../foundation/styled-components';
import {
  height,
  spacing,
  ellipsis,
  width,
} from '../../foundation/utils/styles';

type TowardsProps = {
  type: OPERATION;
  disabled: boolean;
  tooltipTitle: string;
  onClick: ((event: React.MouseEvent<HTMLSpanElement>) => void);
  menu: { pathname: string; title: string }[];
  onClickMenu: (type: OPERATION, index: number) => void;
};

const MenuListCompositionWrapper = styled.div`
  position: relative;
  display: flex;
  margin-right: ${spacing(1)};
`;

const MenuWrapper = styled(Popper)`
  margin-top: ${spacing(2)};
  margin-left: ${spacing(2)};
`;
const StyledMenuItem = styled(MenuItem)`
  && {
    min-width: ${width(20)};
    max-width: ${width(72)};
    ${ellipsis()};
    display: block;
    line-height: ${height(8)};
    font-size: ${({ theme }) => theme.typography.caption2.fontSize};
    padding-top: 0;
    padding-bottom: 0;
    height: ${height(8)};
  }
`;

export class JuiHistoryOperation extends React.Component<
  TowardsProps,
  { open: boolean; anchorEl: HTMLElement | null }
> {
  private _clickMenuHander: {
    [key: string]: (event: React.MouseEvent<HTMLElement>) => void;
  } = {};
  private _showPopup: boolean = false;
  constructor(props: TowardsProps) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null,
    };
  }

  getClickMenuHander = (key: string, type: OPERATION, index: number) => {
    let hander = this._clickMenuHander[key];
    if (!hander) {
      hander = (event: React.MouseEvent<HTMLElement>) =>
        this.handleMenuItemClick(event, type, index);
      this._clickMenuHander[key] = hander;
      return hander;
    }

    return hander;
  }

  handleToggle = (target: EventTarget & HTMLElement) => {
    this._showPopup = true;
    this.setState({ anchorEl: target, open: !this.state.open });
  }

  handleClose = (event: React.MouseEvent<HTMLElement>) => {
    if (this._showPopup) {
      this._showPopup = false;
      return;
    }
    const { anchorEl } = this.state;
    if (anchorEl && anchorEl.contains(event.currentTarget)) {
      return;
    }

    this.setState({ open: false, anchorEl: null });
  }

  handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    type: OPERATION,
    index: number,
  ) => {
    this.handleClose(event);
    const { onClickMenu } = this.props;
    onClickMenu(type, index);
  }

  render() {
    const { open, anchorEl } = this.state;

    const { menu = [], disabled, onClick, type, tooltipTitle } = this.props;
    return (
      <MenuListCompositionWrapper>
        <TowardIcons
          tooltipTitle={tooltipTitle}
          disabled={disabled}
          onClick={onClick}
          onLongPress={this.handleToggle}
          type={type}
        />
        <MenuWrapper
          open={open}
          anchorEl={anchorEl}
          transition={true}
          disablePortal={true}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList>
                    {menu.map(({ title, pathname }, index: number) => {
                      const key = `${index} - ${pathname}`;
                      return (
                        <StyledMenuItem
                          onClick={this.getClickMenuHander(key, type, index)}
                          key={key}
                        >
                          {title}
                        </StyledMenuItem>
                      );
                    })}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </MenuWrapper>
      </MenuListCompositionWrapper>
    );
  }
}
