/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 13:27:55
 * Copyright © RingCentral. All rights reserved.
 */
import Card, { CardProps } from '@material-ui/core/Card';
import styled from '../../foundation/styled-components';

type JuiCardProps = CardProps;

const JuiCard = styled(Card)``;

JuiCard.displayName = 'JuiCard';

export { JuiCard, JuiCardProps };
