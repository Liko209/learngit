/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItemIcon, {
  ListItemIconProps as MuiListItemIconProps,
} from '@material-ui/core/ListItemIcon';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiListItemIconProps = MuiListItemIconProps;

const StyledListItemIcon = styled(MuiListItemIcon)`
  && {
    margin-right: ${spacing(2)};
  }
`;

const JuiListItemIcon = (props: JuiListItemIconProps) => {
  const { children } = props;
  return <StyledListItemIcon>{children}</StyledListItemIcon>;
};

JuiListItemIcon.displayName = 'JuiListItemIcon';

export { JuiListItemIcon, JuiListItemIconProps };
