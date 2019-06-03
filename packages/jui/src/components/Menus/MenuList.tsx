/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiMenuList, {
  MenuListProps as MuiMenuListProps,
} from '@material-ui/core/MenuList';
import styled from '../../foundation/styled-components';
import { width, height } from '../../foundation/utils';

type JuiMenuListProps = MuiMenuListProps;

const JuiMenuList = styled(MuiMenuList)`
  && {
    max-width: ${width(320)};
    max-height: ${height(104)};
    overflow: auto;
  }
`;

JuiMenuList.displayName = 'JuiMenuList';

export { JuiMenuList, JuiMenuListProps };
