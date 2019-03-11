/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-07 09:26:28
 * Copyright © RingCentral. All rights reserved.
 */

import { keyframes } from '../../../foundation/styled-components';

const imageViewerHeaderAnimation = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to{
    transform: translateY(0)
    opacity: 1;
  }
`;
export { imageViewerHeaderAnimation };
