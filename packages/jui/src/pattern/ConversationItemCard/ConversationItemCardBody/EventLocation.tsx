/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 09:38:13
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  location: string;
};

const StyledEventLocation = styled.div`
  ${typography('body1')};
  color: ${grey('900')};
`;

const JuiEventLocation = memo((props: Props) => (
  <StyledEventLocation>{props.location}</StyledEventLocation>
));

JuiEventLocation.displayName = 'JuiEventLocation';

export { JuiEventLocation };
