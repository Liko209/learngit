/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:03:38
 * Copyright © RingCentral. All rights reserved.
 */

import Popper, { PopperProps } from '@material-ui/core/Popper';
import styled from '../../foundation/styled-components';

type JuiPopperProps = PopperProps;

const JuiPopper = styled(Popper)`
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

JuiPopper.displayName = 'JuiPopper';

export { JuiPopper, JuiPopperProps };
