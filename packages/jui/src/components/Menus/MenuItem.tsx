/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiMenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from '@material-ui/core/MenuItem';
import styled from '../../foundation/styled-components';
import {
  height,
  spacing,
  typography,
  grey,
  palette,
} from '../../foundation/utils';

type JuiMenuItemProps = MuiMenuItemProps;

const JuiMenuItem = styled(MuiMenuItem)`
  && {
    ${typography('caption1')};
    color: ${grey('900')};
    height: ${height(8)};
    line-height: ${height(8)};
    padding: ${spacing(0, 4)};

    &:hover {
      background-color: ${palette('grey', '500', 1)};
    }

    &:active {
      background-color: ${palette('grey', '500', 2)};
    }
  }
`;

JuiMenuItem.displayName = 'JuiMenuItem';

export { JuiMenuItem, JuiMenuItemProps };
