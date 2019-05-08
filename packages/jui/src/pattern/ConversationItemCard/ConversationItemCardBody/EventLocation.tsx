/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 09:38:13
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';
import { withHighlight } from '../../../hoc/withHighlight';

type Props = {
  location: string;
};

const StyledEventLocation = styled.div`
  ${typography('body1')};
  color: ${grey('900')};
`;

const JuiEventLocation = withHighlight(['location'])(
  memo(({ location }: Props) => (
    <StyledEventLocation dangerouslySetInnerHTML={{ __html: location }} />
  )),
);

JuiEventLocation.displayName = 'JuiEventLocation';

export { JuiEventLocation };
