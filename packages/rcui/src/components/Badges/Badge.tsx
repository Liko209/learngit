/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { SFC, memo } from 'react';
import MuiBadge, { BadgeProps as MuiBadgeProps } from '@material-ui/core/Badge';
import styled, { css } from '../../foundation/styled-components';

const MAX_SIZE = 6;

const badgeWidth = `${MAX_SIZE * 4}px`;
const badgeHeight = `${MAX_SIZE * 4}px`;
const badgeOffsetX = `${-(MAX_SIZE / 2) * 4}px`;
const badgeOffsetY = `${-(MAX_SIZE / 2) * 4}px`;

const badgePlacementStyles = {
  'top-left': css`
    top: ${badgeOffsetY};
    right: auto;
    bottom: auto;
    left: ${badgeOffsetX};
  `,
  'top-right': css`
    top: ${badgeOffsetY};
    right: ${badgeOffsetX};
    bottom: auto;
    left: auto;
  `,
  'bottom-left': css`
    top: auto;
    right: auto;
    bottom: ${badgeOffsetY};
    left: ${badgeOffsetX};
  `,
  'bottom-right': css`
    top: auto;
    right: ${badgeOffsetX};
    bottom: ${badgeOffsetY};
    left: auto;
  `,
};

const StyledBadge = styled<RuiBadgeProps>(MuiBadge)`
  .badge {
    width: ${badgeWidth};
    height: ${badgeHeight};
    ${({ placement }) => badgePlacementStyles[placement!]};
  }
`;

type RuiBadgeProps = Pick<MuiBadgeProps, 'children' | 'classes'> & {
  placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

const RuiBadge: SFC<RuiBadgeProps> = memo((props: RuiBadgeProps) => (
  <StyledBadge
    {...props}
    classes={{
      badge: 'badge',
    }}
  >
    {props.children}
  </StyledBadge>
));

RuiBadge.defaultProps = {
  placement: 'top-right',
};

RuiBadge.displayName = 'RuiBadge';

export { RuiBadge, RuiBadgeProps };
