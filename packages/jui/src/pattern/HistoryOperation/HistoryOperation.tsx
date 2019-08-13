/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 13:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { TowardIcons } from './TowardIcons';
import { OPERATION } from './types';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils/styles';
import { JuiMenuItem, JuiMenuList } from '../../components/Menus';
import { JuiPopover } from '../../components/Popover';

type TowardsProps = {
  type: OPERATION;
  disabled: boolean;
  tooltipTitle: string;
  onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
  menu: () => { pathname: string; title: string }[];
  onClickMenu: (type: OPERATION, index: number) => void;
  menuItemMaxWidth?: number;
};

export const MenuListCompositionWrapper = styled.div`
  position: relative;
  display: flex;
`;

const MenuListItemWrapper = styled.div`
  ${ellipsis()}
`;

export class JuiHistoryOperation extends React.PureComponent<
  TowardsProps,
  { open: boolean; showMenuItems: boolean; anchorEl: HTMLElement | null }
> {
  private _clickMenuHandler: {
    [key: string]: (event: React.MouseEvent<HTMLElement>) => void;
  } = {};
  private _timerId: NodeJS.Timeout;
  constructor(props: TowardsProps) {
    super(props);
    this.state = {
      open: false,
      showMenuItems: false,
      anchorEl: null,
    };
  }

  private _getClickMenuHandler = (
    key: string,
    type: OPERATION,
    index: number,
  ) => {
    let handler = this._clickMenuHandler[key];
    if (!handler) {
      handler = (event: React.MouseEvent<HTMLElement>) =>
        this._handleMenuItemClick(event, type, index);
      this._clickMenuHandler[key] = handler;
      return handler;
    }

    return handler;
  };

  private _handleLongPress = (target: EventTarget & HTMLElement) => {
    this.setState({ anchorEl: target, open: true, showMenuItems: true });
  };

  private _handleClose = (event: React.MouseEvent<HTMLElement>) => {
    const { anchorEl } = this.state;
    if (anchorEl && anchorEl.contains(event.currentTarget)) {
      return;
    }

    this.setState({ open: false, anchorEl: null }, () => {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(
        () =>
          this.setState({
            showMenuItems: false,
          }),
        1000,
      );
    });
  };

  private _handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    type: OPERATION,
    index: number,
  ) => {
    this._handleClose(event);
    const { onClickMenu } = this.props;
    onClickMenu(type, index);
  };

  private _renderMenuItems = () => {
    const { open, showMenuItems } = this.state;
    const { menu, menuItemMaxWidth, type } = this.props;

    if (!open && !showMenuItems) {
      return null;
    }

    return (
      <JuiMenuList>
        {menu().map(({ title, pathname }, index: number) => {
          const key = `${index} - ${pathname}`;
          return (
            <JuiMenuItem
              onClick={this._getClickMenuHandler(key, type, index)}
              maxWidth={menuItemMaxWidth}
              key={key}
            >
              <MenuListItemWrapper>{title}</MenuListItemWrapper>
            </JuiMenuItem>
          );
        })}
      </JuiMenuList>
    );
  };

  componentWillUnmount() {
    clearTimeout(this._timerId);
  }

  render() {
    const { open, anchorEl } = this.state;
    const { disabled, onClick, type, tooltipTitle } = this.props;

    return (
      <MenuListCompositionWrapper>
        <TowardIcons
          tooltipTitle={tooltipTitle}
          disabled={disabled}
          onClick={onClick}
          onLongPress={this._handleLongPress}
          type={type}
        />
        <JuiPopover
          open={open}
          anchorEl={anchorEl}
          onClick={this._handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {this._renderMenuItems()}
        </JuiPopover>
      </MenuListCompositionWrapper>
    );
  }
}
