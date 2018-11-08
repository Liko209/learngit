/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 10:14:41
 * Copyright © RingCentral. All rights reserved.
 */
import MuiCardHeader, { CardHeaderProps } from '@material-ui/core/CardHeader';
import styled from '../../foundation/styled-components';

type JuiCardHeaderProps = CardHeaderProps;

const JuiCardHeader = styled(MuiCardHeader)``;

JuiCardHeader.displayName = 'JuiCardHeader';

export { JuiCardHeader, JuiCardHeaderProps };
