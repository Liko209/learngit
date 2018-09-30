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
import { IconsProps } from './types';
import styled from '../../foundation/styled-components';
import { height, spacing, ellipsis, width } from '../../foundation/utils/styles';

type TowardsProps = IconsProps & {
  menuItems: string[];
  open: boolean;
  onClose: ((event: React.ChangeEvent<{}> | React.TouchEvent | React.MouseEvent<HTMLElement>, index?: number) => void);
};

const MenuListCompositionWrapper = styled.div`
  position: relative;
  display: flex;
  margin-right: ${spacing(1)};
`;

const MenuWrapper = styled(Popper)`
  margin-top: ${spacing(10)};
  margin-left: ${spacing(2)};
`;
const StyledMenuItem = styled(MenuItem)`
  && {
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

export class JuiBackNForward extends React.Component<TowardsProps> {
  constructor(props: TowardsProps) {
    super(props);
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
                      menuItems.map((item: string, index: number) => {
                        return (<StyledMenuItem onClick={onClose.bind(this, event, index)} key={index}>{item}</StyledMenuItem>);
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
