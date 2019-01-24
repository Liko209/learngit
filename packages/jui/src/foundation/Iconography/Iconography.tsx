/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiIcon, { IconProps as MuiIconProps } from '@material-ui/core/Icon';
import name2icon from './name2icon';
import styled from '../../foundation/styled-components';
import { Omit } from '../utils/typeHelper';
import { Palette } from '../theme/theme';
import { palette } from '../../foundation/utils/styles';

type JuiIconographyProps = Omit<MuiIconProps, 'color'> & {
  color?: string;
};

type StyledIconProps = JuiIconographyProps & {
  colorName: string;
  colorScope: keyof Palette;
};

const WrappedMuiIcon = ({
  color,
  colorName,
  colorScope,
  ...rest
}: StyledIconProps) => <MuiIcon {...rest} />;

const StyledIcon = styled<StyledIconProps>(WrappedMuiIcon)`
  display: block;
  color: ${({ theme, colorScope, colorName }) =>
    palette(colorScope, colorName)({ theme })};
`;

const JuiIconography: React.SFC<JuiIconographyProps> & {
  dependencies?: any[];
} = (props: JuiIconographyProps) => {
  const iconName = props.children as string;
  const className = `${props.className} ${name2icon[iconName]} icon`;
  const color = props.color;

  let colorScope: keyof Palette = 'grey';
  let colorName: string = '500';
  if (color && color.indexOf('.') >= 0) {
    const array = color.split('.');
    if (array.length > 1) {
      colorScope = array[0] as keyof Palette;
      colorName = array[1];
    } else {
      colorScope = array[0] as keyof Palette;
    }
  }
  return (
    <StyledIcon
      {...props}
      className={className}
      colorScope={colorScope}
      colorName={colorName}
    >
      {iconName}
    </StyledIcon>
  );
};

JuiIconography.displayName = 'JuiIconography';
JuiIconography.dependencies = [MuiIcon];

export { JuiIconographyProps, JuiIconography };
