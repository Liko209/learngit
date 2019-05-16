/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 10:05:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';
import { withHighlight } from '../../../hoc/withHighlight';

type Props = {
  description: string;
};

const StyledEventDescription = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;

const JuiEventDescriptionComponent = ({ description }: Props) => (
  <StyledEventDescription dangerouslySetInnerHTML={{ __html: description }} />
);

JuiEventDescriptionComponent.displayName = 'JuiEventDescription';

const JuiEventDescription = withHighlight(['description'])(
  memo(JuiEventDescriptionComponent),
);

export { JuiEventDescription };
