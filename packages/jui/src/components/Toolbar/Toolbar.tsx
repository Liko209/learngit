/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:03:38
 * Copyright © RingCentral. All rights reserved.
 */

import MuiToolbar, { ToolbarProps as MuiToolbarProps } from '@material-ui/core/Toolbar';
import styled from '../../foundation/styled-components';

type JuiToolbarProps = MuiToolbarProps;

const JuiToolbar = styled(MuiToolbar)``;

JuiToolbar.displayName = 'JuiToolbar';
JuiToolbar.dependencies = [MuiToolbar];

export { JuiToolbar, JuiToolbarProps };
