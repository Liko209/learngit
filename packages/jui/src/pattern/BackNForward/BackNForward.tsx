/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 13:58:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { TowardIcons } from './TowardIcons';
import { IconsProps } from './types';

type TIconMore = {
  menuItems?: string[];
  open?: boolean;
  onClose?: ((event: React.ChangeEvent | React.TouchEvent | React.MouseEvent<HTMLElement>, index?: number) => void);
} & IconsProps;

const MenuListCompositionWrapper = styled.div`
  position: relative;
  display: flex;
  margin-right: ${({ theme }) => `${1 * theme.spacing.unit}px`};
`;

const MenuWrapper = styled(Popper)`
  margin-top: ${({ theme }) => theme.spacing.unit * 10}px;
  margin-left: ${({ theme }) => theme.spacing.unit * 2}px;
`;
const StyledMenuItem = styled(MenuItem)`
  && {
    font-size: ${({ theme }) => `${theme.typography.caption2.fontSize}`};
    padding-top: 0;
    padding-bottom: 0;
    height: ${({ theme }) => theme.size.height * 8}px;
  }
`;
enum ICON_TYPES {
  LEFT = 'backward',
  RIGHT = 'forward',
}
export class BackNForward extends React.Component<TIconMore> {
  constructor(props: TIconMore) {
    super(props);
  }
  componentWillReceiveProps(nextProps: TIconMore) {
    if (this.props.open !== nextProps.open) {
      this.setState({
        open: nextProps.open,
      });
    }
  }
  anchorEl = React.createRef<Element>();

  render() {
    const {
      menuItems = [],
      onClose,
      open = false,
      backDisabled,
      forwardDisabled,
      onBackWard,
      onForWard,
      onButtonPress,
      onButtonRelease,
      types,
    } : {
      types: ICON_TYPES,
    } = this.props;
    return (
      <MenuListCompositionWrapper>
        <TowardIcons
          backDisabled={backDisabled}
          forwardDisabled={forwardDisabled}
          onBackWard={onBackWard}
          onForWard={onForWard}
          onButtonPress={onButtonPress}
          types={types}
          onButtonRelease={onButtonRelease}
        />
        <MenuWrapper
          open={open}
          anchorEl={this.anchorEl.current}
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
                <ClickAwayListener onClickAway={onClose}>
                  <MenuList>
                    {
                      menuItems.map((item, index) => {
                        return (<StyledMenuItem onClick={onClose!.bind(this, event, index)} key={index}>{item}</StyledMenuItem>);
                      })
                    }
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
