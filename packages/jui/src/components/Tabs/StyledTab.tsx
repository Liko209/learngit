/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import MuiTab, { TabProps as MuiTabProps } from '@material-ui/core/Tab';
import styled from '../../foundation/styled-components';
import {
  width,
  height,
  ellipsis,
  typography,
  grey,
  primary,
} from '../../foundation/utils';

const StyledTab = styled<MuiTabProps>(MuiTab)`
  &.root {
    min-width: ${width(8)};
    max-width: ${width(30)};
    min-height: ${height(8)};
  }
  &.selected {
    .label {
      color: ${primary('700')}
    }
  }
  .labelContainer {
    padding-left: 8px;
    padding-right: 8px;
    ${ellipsis}
    width: 100%;
    box-sizing: border-box;
  }
  .label {
    ${typography('caption2')}
    color: ${grey('900')}
  }
`;

export { StyledTab };
