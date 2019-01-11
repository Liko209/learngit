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
  flex-basis: ${height(12)};
  flex-shrink: 0;
  background-color: ${palette('common', 'white')};
  padding: ${spacing(0, 2)};
  color: ${grey('900')};
  display: flex;
  align-items: center;
`;

const JuiRightShelfHeaderText = styled('div')`
  flex: 1;
  ${ellipsis()}
`;
const JuiRightShelfHeaderIcon = styled('div')`
  display: inline-flex;
`;

export {
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
};
