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
  width,
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
    min-width: ${width(28)};
    max-width: ${width(80)};
    line-height: ${height(8)};
    padding: ${spacing(0, 4)};
    box-sizing: border-box;

    &:hover {
      background-color: ${palette('grey', '500', 1)};
    }

    &:active {
      background-color: ${palette('primary', 'main')};
      color: ${palette('common', 'white')};
    }
  }
`;

JuiMenuItem.displayName = 'JuiMenuItem';

export { JuiMenuItem, JuiMenuItemProps };
