/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-28 13:34:40
 * Copyright © RingCentral. All rights reserved.
 */
import { height } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';

const PhoneWrapper = styled.div<{ pageHeight?: number }>`
  margin: 0 auto;
  width: 100%;
  height: ${props => (props.pageHeight ? `${props.pageHeight}px` : '100%')};
  position: relative;
  max-width: ${height(200)};
`;

export { PhoneWrapper };
