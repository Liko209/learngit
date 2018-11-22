/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:13:56
 * Copyright © RingCentral. All rights reserved.
 */

import tinycolor from 'tinycolor2';
import styled, { css } from '../../foundation/styled-components';
import { spacing, primary } from '../../foundation/utils';

type StyledMiniCardHeaderProps = {
  emphasize?: boolean;
};

const StyledMiniCardHeader = styled<StyledMiniCardHeaderProps, 'div'>('div')`
  padding: ${spacing(4, 5)};
  ${({ emphasize }: StyledMiniCardHeaderProps) =>
    emphasize &&
    css`
      background-color: ${({ theme }) =>
        tinycolor(primary('700')({ theme }))
          .setAlpha(theme.palette.action.hoverOpacity / 1.5)
          .toRgbString()};
    `}
`;

StyledMiniCardHeader.displayName = 'StyledMiniCardHeader';

export { StyledMiniCardHeader };
