/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListSubheader, {
  ListSubheaderProps as MuiListSubheaderProps,
} from '@material-ui/core/ListSubheader';
import styled from '../../foundation/styled-components';
import {
  height,
  spacing,
  palette,
  grey,
  typography,
} from '../../foundation/utils/styles';

type JuiListSubheaderProps = MuiListSubheaderProps;

const JuiListSubheader = styled(MuiListSubheader)`
  && {
    height: ${height(9)};
    display: flex;
    padding: ${spacing(3, 2, 1, 4)} !important;
    background: ${palette('common', 'white')};
    color: ${grey('700')};
    ${typography('body1')}
  }
`;

JuiListSubheader.displayName = 'JuiListSubheader';

export { JuiListSubheader, JuiListSubheaderProps };
