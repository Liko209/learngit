/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-29 18:56:29
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { JuiTypography } from '../../foundation/Typography';
import { grey, typography, spacing } from '../../foundation/utils/styles';

const StyledTip = styled(JuiTypography)`
  && {
    color: ${grey('500')};
    ${typography('caption1')}
  }
`;

const E911Description = styled(StyledTip)`
  padding: ${spacing(0, 0, 4)};
`;

const E911Disclaimers = styled(JuiTypography)`
  && {
    ${typography('subheading2')}
    padding: ${spacing(4, 0, 1.5)};
  }
`;

export { StyledTip, E911Description, E911Disclaimers };
