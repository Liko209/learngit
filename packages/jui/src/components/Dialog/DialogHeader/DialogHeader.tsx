/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 13:19:14
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils/styles';

type JuiDialogHeaderProps = {
  fullscreen?: boolean;
};
const JuiDialogHeader = styled.div<JuiDialogHeaderProps>`
  background-color: white;
  padding: ${({ fullscreen }) => spacing(fullscreen ? 2 : 5, 6)};
  display: flex;
  align-items: center;
`;

export { JuiDialogHeader, JuiDialogHeaderProps };
