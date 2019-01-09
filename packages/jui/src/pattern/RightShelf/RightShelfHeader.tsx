/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:55:30
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import {
  palette,
  spacing,
  height,
  grey,
  typography,
  ellipsis,
} from '../../foundation/utils';

const JuiRightShelfHeader = styled('div')`
  ${typography('subheading1')}
  height: ${height(12)};
  background-color: ${palette('common', 'white')};
  padding: ${spacing(0, 2)};
  color: ${grey('900')};
  display: flex;
  align-items: center;
`;

const JuiRightShelfHeaderText = styled('div')`
  flex: 1;
  max-width: 80%;
  ${ellipsis}
`;
const JuiRightShelfHeaderIcon = styled('div')`
  position: absolute;
  top: 4px;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.dragging};
`;

export {
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
};
