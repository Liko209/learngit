/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-25 19:57:34
 * Copyright © RingCentral. All rights reserved.
 */
import tinycolor from 'tinycolor2';
import styled from '../../foundation/styled-components';
import { JuiListItem } from '../../components/Lists';
import { height, spacing, opacity, grey } from '../../foundation/utils';

const JuiContactCell = styled(JuiListItem)`
  && {
    height: ${height(16)};
    padding: ${spacing(3, 4)};
    cursor: pointer;
  }
  &:not(:last-child) {
    border-bottom: ${({ theme }) => theme.shape.border4};
  }

  &:hover {
    background-color: ${({ theme }) =>
      tinycolor(grey('900')({ theme }))
        .setAlpha(opacity('05')({ theme }))
        .toRgbString()};
  }
`;

export { JuiContactCell };
