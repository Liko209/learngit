/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-29 16:16:05
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../foundation/styled-components';
import { JuiTypography } from '../../foundation/Typography';
import { spacing, width, typography } from '../../foundation/utils';

const JuiLogo = styled(JuiTypography)`
  && {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: white;
    box-sizing: border-box;
    ${typography('headline')};
    font-weight: bold;
    padding-left: ${spacing(6)};
    width: ${width(47.5)};
  }
`;

JuiLogo.displayName = 'JuiLogo';

export { JuiLogo };
