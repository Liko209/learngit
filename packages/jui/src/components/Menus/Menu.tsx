/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiMenu, { MenuProps as MuiMenuProps } from '@material-ui/core/Menu';
import styled from '../../foundation/styled-components';

type JuiMenuProps = MuiMenuProps;

const JuiMenu = styled(MuiMenu)``;

JuiMenu.displayName = 'JuiMenu';
JuiMenu.dependencies = [MuiMenu];

export { JuiMenu, JuiMenuProps };
