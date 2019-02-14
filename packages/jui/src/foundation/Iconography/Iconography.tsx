/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:05
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import MuiIcon, { IconProps as MuiIconProps } from '@material-ui/core/Icon';
import name2icon from './name2icon';
import styled, { css } from '../../foundation/styled-components';
import { Omit } from '../utils/typeHelper';
import { Palette } from '../theme/theme';
import { palette } from '../../foundation/utils/styles';

type JuiIconographyProps = Omit<MuiIconProps, 'color'> & {
  color?: [keyof Palette, string];
};

const WrappedMuiIcon = ({ color, ...rest }: JuiIconographyProps) => (
  <MuiIcon {...rest} />
);

const StyledIcon = styled<JuiIconographyProps>(WrappedMuiIcon)`
  display: block;
  ${({ theme, color }) => {
    if (!color) {
      return;
    }
    const colorScope = color[0] || 'grey';
    const colorName = color[1] || '500';
    return css`
      color: ${palette(colorScope, colorName)({ theme })}};
    `;
  }}
`;

const JuiIconographyComponent: React.SFC<JuiIconographyProps> & {
  dependencies?: any[];
} = (props: JuiIconographyProps) => {
  const { children, className, color } = props;
  const iconName = children as string;
  const _className = `${className} ${name2icon[iconName]} icon`;

  return (
    <StyledIcon {...props} className={_className} color={color}>
      {iconName}
    </StyledIcon>
  );
};

JuiIconographyComponent.displayName = 'JuiIconography';
JuiIconographyComponent.dependencies = [MuiIcon];

const JuiIconography = React.memo(JuiIconographyComponent);
export { JuiIconographyProps, JuiIconography };
