/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:19
 * Copyright © RingCentral. All rights reserved.
 */
import styled from 'styled-components';
import MuiDivider from '@material-ui/core/Divider';

const Divider = styled(MuiDivider)`
  && {
    background-color: ${({ theme }) => theme.palette.grey['300']};
  }
`;

export { Divider };
export default Divider;
