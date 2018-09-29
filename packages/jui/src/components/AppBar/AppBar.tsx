/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:03:38
 * Copyright © RingCentral. All rights reserved.
 */

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@material-ui/core/AppBar';
import styled from '../../foundation/styled-components';

type JuiAppBarProps = MuiAppBarProps;

const JuiAppBar = styled(MuiAppBar)``;

JuiAppBar.displayName = 'JuiAppBar';
JuiAppBar.dependencies = [MuiAppBar];

export { JuiAppBar, JuiAppBarProps };
