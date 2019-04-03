/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { SFC, memo } from 'react';
import MuiBadge, { BadgeProps as MuiBadgeProps } from '@material-ui/core/Badge';
import styled, { css } from '../../foundation/styled-components';
import { Omit } from '../../foundation/utils/typeHelper';
import { width, height } from '../../foundation/utils/styles';

const MAX_SIZE = 6;

const badgeWidth = () => width(MAX_SIZE);
const badgeHeight = () => height(MAX_SIZE);
const badgeOffsetX = () => width(-MAX_SIZE / 2);
const badgeOffsetY = () => height(-MAX_SIZE / 2);

const badgePlacementStyles = {
  'top-left': css`
    top: ${badgeOffsetY()};
    right: auto;
    bottom: auto;
    left: ${badgeOffsetX()};
  `,
  'top-right': css`
    top: ${badgeOffsetY()};
    right: ${badgeOffsetX()};
    bottom: auto;
    left: auto;
  `,
  'bottom-left': css`
    top: auto;
    right: auto;
    bottom: ${badgeOffsetY()};
    left: ${badgeOffsetX()};
  `,
  'bottom-right': css`
    top: auto;
    right: ${badgeOffsetX()};
    bottom: ${badgeOffsetY()};
    left: auto;
  `,
};

const StyledBadge = styled<JuiBadgeProps>(MuiBadge)`
  .badge {
    width: ${badgeWidth()};
    height: ${badgeHeight()};
    ${({ placement }) => badgePlacementStyles[placement!]};
  }
`;

export type JuiBadgeProps = Omit<MuiBadgeProps, 'innerRef'> & {
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

const JuiBadge: SFC<JuiBadgeProps> = memo((props: JuiBadgeProps) => (
  <StyledBadge
    {...props}
    classes={{
      badge: 'badge',
    }}
  >
    {props.children}
  </StyledBadge>
));

JuiBadge.defaultProps = {
  placement: 'top-right',
};

JuiBadge.displayName = 'JuiBadge';

export { JuiBadge, MuiBadgeProps };
