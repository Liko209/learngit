import React from 'react';
import Fab from '@material-ui/core/Fab';
import tinycolor from 'tinycolor2';
import styled from '../../../foundation/styled-components';
import { RuiIconography, ICON_NAME } from '../../Iconography';
// import { Theme } from '../../../foundation/styles';
import { palette } from '../../../foundation/shared/theme';
// import { hoverStyle } from './utils/tools';
import { Theme } from 'foundation/styles';

const fabSizing = {
  small: '32px',
  medium: '48px',
  large: '64px',
};

const iconSizing = {
  small: '10px',
  medium: '16px',
  large: '21px',
};

type Color = 'primary' | 'secondary' | 'inherit';

type FabProps = {
  color?: Color;
  size: 'small' | 'medium' | 'large';
  icon: ICON_NAME;
  className?: string;
};

const StyledIcon = styled(RuiIconography)``;

const RuiFabIcon = (props: FabProps) => {
  const { size, className, icon } = props;
  return (
    <Fab size={size} className={className}>
      <StyledIcon icon={icon} />
    </Fab>
  );
};

function hoverStyles(theme: Theme, color?: Color): string {
  if (!color || color === 'inherit') {
    return tinycolor('#fff').darken(8).toRgbString();
  }
  const c = palette(color, 'main')({ theme });
  return tinycolor(c)
    .darken(8)
    .toRgbString();
}

export default styled(RuiFabIcon)`
  && {
    background-color: ${({ color, theme }) => (
    color && color !== 'inherit'
      ? palette(color, 'main')({ theme })
      : 'inherit')
  };
    color:${({ theme }) => theme.palette.text.primary};
    width: ${({ size }) => fabSizing[size]};
    height: ${({ size }) => fabSizing[size]};
    min-height: ${fabSizing['small']};
    ${StyledIcon} {
      &,
      svg {
        font-size: ${({ size }) => iconSizing[size]};
      }
    }

    &:hover {
      background-color: ${({ color, theme }) => hoverStyles(theme, color)}
    }
  }
`;
