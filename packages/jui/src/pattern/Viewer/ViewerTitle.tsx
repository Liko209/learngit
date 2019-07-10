/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { spacing, typography } from '../../foundation/utils/styles';

const JuiViewerTitleWrap = styled.span`
  && {
    display: inline-flex;
    align-items: center;
    > div {
      margin: 0 ${spacing(2)};
      width: ${spacing(12)};
    }
    input {
      text-align: center;
      ${typography('body1')};
      padding: ${spacing(1)} 0;
    }
  }
`;

const JuiViewerImg = styled.img`
  && {
    width: 100%;
  }
`;

export { JuiViewerTitleWrap, JuiViewerImg };
