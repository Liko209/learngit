/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiList, { ListProps as MuiListProps } from '@material-ui/core/List';
import styled from '../../foundation/styled-components';

type JuiListProps = MuiListProps & {
  component?: React.ElementType;
};

const JuiList = styled<JuiListProps>(MuiList)``;

JuiList.displayName = 'JuiList';

export { JuiList, JuiListProps };
