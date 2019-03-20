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
    ${typography('headline')};
    font-weight: bold;
    margin-left: ${spacing(4)};
    margin-right: ${spacing(9)};
    width: ${width(41)};
  }
`;

JuiLogo.displayName = 'JuiLogo';

export { JuiLogo };
