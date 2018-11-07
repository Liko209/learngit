/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 11:04:25
 * Copyright © RingCentral. All rights reserved.
 */
import CardMedia, { CardMediaProps } from '@material-ui/core/CardMedia';
import styled from '../../foundation/styled-components';

type JuiCardMediaProps = CardMediaProps;

const JuiCardMedia = styled(CardMedia)``;

JuiCardMedia.displayName = 'JuiCardMedia';

export { JuiCardMedia, JuiCardMediaProps };
