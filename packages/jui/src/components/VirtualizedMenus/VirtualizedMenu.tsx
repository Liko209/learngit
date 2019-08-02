/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:39:23
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiMenuProps } from '../Menus/Menu';
import {
  JuiVirtualizedMenuList,
  JuiVirtualizedMenuListProps,
} from './VirtualizedMenuList';
import { JuiPopover } from '../Popover';

type JuiVirtualizedMenuProps = JuiVirtualizedMenuListProps & JuiMenuProps;

const StyledMenu = styled(JuiPopover)`
  & .virtualized-menu-paper {
    display: flex;
    flex-direction: column;
  }

  & .virtualized-menu-list {
    height: 100%;
    /* TODO support padding in virtualized menu */
    padding: 0;
  }
`;

const CLASSES = {
  paper: 'virtualized-menu-paper',
};

const JuiVirtualizedMenu = ({
  initialFocusedIndex,
  children,
  loop = false,
  focusOnHover = true,
  ...rest
}: JuiVirtualizedMenuProps) => {
  return (
    <StyledMenu classes={CLASSES} {...rest}>
      <JuiVirtualizedMenuList
        initialFocusedIndex={initialFocusedIndex}
        loop={loop}
        focusOnHover={focusOnHover}
      >
        {children}
      </JuiVirtualizedMenuList>
    </StyledMenu>
  );
};

export { JuiVirtualizedMenu, JuiVirtualizedMenuProps };
