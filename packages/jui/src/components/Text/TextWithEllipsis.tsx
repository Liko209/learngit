/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-12 13:08:36
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils';
import { Typography as MuiTypography } from '@material-ui/core';

const JuiTextWithEllipsis = styled(MuiTypography)`
  ${ellipsis()}
`;

export { JuiTextWithEllipsis };
