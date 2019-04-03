/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import MuiListItemIcon, {
  ListItemIconProps as MuiListItemIconProps,
} from '@material-ui/core/ListItemIcon';
import styled from '../../foundation/styled-components';
import { spacing, width, height, grey, shape } from '../../foundation/utils';

type JuiListItemIconProps = MuiListItemIconProps;

const MuiListItemIconWrapper = styled(MuiListItemIcon)`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${width(9)};
    height: ${height(9)};
    margin-right: ${spacing(2)};
    background-color: ${grey('100')};
    border-radius: ${shape('borderRadius')};
    overflow: hidden;
  }
`;

const JuiListItemIconComponent = (props: JuiListItemIconProps) => {
  const { children } = props;
  return <MuiListItemIconWrapper {...props}>{children}</MuiListItemIconWrapper>;
};

JuiListItemIconComponent.displayName = 'JuiListItemIcon';

const JuiListItemIcon = memo(JuiListItemIconComponent);

export { JuiListItemIcon, JuiListItemIconProps };
