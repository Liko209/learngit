/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 13:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { TowardIcons } from './TowardIcons';
import { OPERATION } from './types';
import styled from '../../foundation/styled-components';
import { spacing, ellipsis } from '../../foundation/utils/styles';
import { JuiMenuItem, JuiPopover, JuiMenuList } from '../../components';

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

const MenuListItemWrapper = styled.div`
  ${ellipsis()}
`;

export class JuiHistoryOperation extends React.PureComponent<
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
        <JuiPopover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          onClick={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <JuiMenuList>
            {menu.map(({ title, pathname }, index: number) => {
              const key = `${index} - ${pathname}`;
              return (
                <JuiMenuItem
                  onClick={this.getClickMenuHander(key, type, index)}
                  key={key}
                >
                  <MenuListItemWrapper>{title}</MenuListItemWrapper>
                </JuiMenuItem>
              );
            })}
          </JuiMenuList>
        </JuiPopover>
      </MenuListCompositionWrapper>
    );
  }
}
