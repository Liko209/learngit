/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiMenuList, {
  MenuListProps as MuiMenuListProps,
} from '@material-ui/core/MenuList';
import styled from '../../foundation/styled-components';

type JuiMenuListProps = MuiMenuListProps;

const JuiMenuList = styled(MuiMenuList)``;

JuiMenuList.displayName = 'JuiMenuList';

export { JuiMenuList, JuiMenuListProps };
