/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';
import styled from '../../foundation/styled-components';

type JuiMenuItemProps = MuiMenuItemProps;

const JuiMenuItem = styled(MuiMenuItem)``;

JuiMenuItem.displayName = 'JuiMenuItem';
JuiMenuItem.dependencies = [MuiMenuItem];

export { JuiMenuItem, JuiMenuItemProps };
