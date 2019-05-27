/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-10 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import styled, { css } from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';

type JuiSettingSectionContainerProps = {
  containerWidth?: number;
};

const MAX_WIDTH = 800;
const MAX_BREAKPOINT = 832;
const MIN_BREAKPOINT = 400;
const MIN_WIDTH = 368;

const JuiSettingSectionContainer = styled.div<JuiSettingSectionContainerProps>`
  && {
    ${({ containerWidth = 0 }) => {
      if (containerWidth > MAX_BREAKPOINT) {
        return css`
          padding: ${spacing(4)} ${(containerWidth - MAX_WIDTH) / 2}px;
          > div {
            width: ${MAX_WIDTH};
          }
        `;
      }
      if (containerWidth < MAX_BREAKPOINT && containerWidth > MIN_BREAKPOINT) {
        return css`
          padding: ${spacing(4)} ${spacing(12.5)};
          > div {
            flex: 1;
          }
        `;
      }
      return css`
        padding: ${spacing(4)};
        > div {
          width: ${MIN_WIDTH};
        }
      `;
    }};
  }
`;

const JuiSettingContainer = styled.div`
  overflow: auto;
  height: 100%;
`;

export {
  JuiSettingSectionContainer,
  JuiSettingSectionContainerProps,
  JuiSettingContainer,
};
