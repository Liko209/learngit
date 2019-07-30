/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-23 13:39:23
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiMenu, JuiMenuProps } from '../Menus/Menu';

type JuiVirtualizedMenuProps = JuiMenuProps;

const StyledMenu = styled(JuiMenu)`
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
  list: 'virtualized-menu-list',
};

const JuiVirtualizedMenu = (props: JuiVirtualizedMenuProps) => {
  return <StyledMenu classes={CLASSES} {...props} />;
};

export { JuiVirtualizedMenu, JuiVirtualizedMenuProps };
