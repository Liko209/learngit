/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:39:23
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiMenuProps } from '../Menus/Menu';
import { JuiVirtualizedMenuList } from './VirtualizedMenuList';
import { JuiPopover } from '../Popover';

type JuiVirtualizedMenuProps = JuiMenuProps & {
  children: JSX.Element[];
  initialFocusedIndex?: number;
};

const StyledMenu = styled(JuiPopover)`
  & .virtualized-menu-paper {
    display: flex;
    flex-direction: column;
  }
`;

const CLASSES = {
  paper: 'virtualized-menu-paper',
};

const JuiVirtualizedMenu = ({
  initialFocusedIndex,
  children,
  ...rest
}: JuiVirtualizedMenuProps) => {
  return (
    <StyledMenu classes={CLASSES} {...rest}>
      <JuiVirtualizedMenuList
        initialFocusedIndex={initialFocusedIndex}
        loop={false}
        focusOnHover
      >
        {children}
      </JuiVirtualizedMenuList>
    </StyledMenu>
  );
};

export { JuiVirtualizedMenu, JuiVirtualizedMenuProps };
