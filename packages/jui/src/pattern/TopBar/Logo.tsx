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
    color: ${({ theme }) => `${theme.palette.primary.main}`};
    ${typography('headline')};
    margin-left: ${spacing(4)};
    /* padding-right: ${spacing(5)}; */
    /* ie compatibility for Topbar width less than 1100px */
    min-width: ${width(50)};
    width: ${width(50)};
  }
`;

JuiLogo.displayName = 'JuiLogo';

export { JuiLogo };
