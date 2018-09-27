/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListSubheader, {
  ListSubheaderProps as MuiListSubheaderProps,
} from '@material-ui/core/ListSubheader';
import styled from '../../foundation/styled-components';

type JuiListSubheaderProps = MuiListSubheaderProps;

const JuiListSubheader = styled(MuiListSubheader)``;

JuiListSubheader.displayName = 'JuiListSubheader';
JuiListSubheader.dependencies = [MuiListSubheader];

export { JuiListSubheader, JuiListSubheaderProps };
