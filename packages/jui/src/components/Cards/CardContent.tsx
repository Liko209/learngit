/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 10:14:41
 * Copyright © RingCentral. All rights reserved.
 */
import MuiCardContent, {
  CardContentProps,
} from '@material-ui/core/CardContent';
import styled from '../../foundation/styled-components';

type JuiCardContentProps = CardContentProps;

const JuiCardContent = styled(MuiCardContent)``;

JuiCardContent.displayName = 'JuiCardContent';

export { JuiCardContent, JuiCardContentProps };
