/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiIcon, { IconProps as MuiIconProps } from '@material-ui/core/Icon';
import name2icon from './name2icon';
import styled from '../../foundation/styled-components';
import './icons/style.css';

type JuiIconographyProps = MuiIconProps;

const JuiIcon = styled(MuiIcon)`
  display: block;
`;

const JuiIconography: React.SFC<JuiIconographyProps> & {
  dependencies?: any[];
} = (props: JuiIconographyProps) => {
  const iconName = props.children as string;
  const className = `${props.className} ${name2icon[iconName]} icon`;
  return (
    <JuiIcon {...props} className={className}>
      {iconName}
    </JuiIcon>
  );
};

JuiIconography.displayName = 'JuiIconography';
JuiIconography.dependencies = [MuiIcon];

export { JuiIconographyProps, JuiIconography };
