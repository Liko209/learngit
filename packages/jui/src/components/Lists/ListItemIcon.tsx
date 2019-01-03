/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItemIcon, {
  ListItemIconProps as MuiListItemIconProps,
} from '@material-ui/core/ListItemIcon';
import styled from '../../foundation/styled-components';

type JuiListItemIconProps = MuiListItemIconProps;

const JuiListItemIcon = styled(MuiListItemIcon)``;

JuiListItemIcon.displayName = 'JuiListItemIcon';

export { JuiListItemIcon, JuiListItemIconProps };
