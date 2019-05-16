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
  children?: string;
};

const StyledEventDescription = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;
function juiEventDescriptionComponent({ children = '' }: Props) {
  if (typeof children === 'string') {
    return <StyledEventDescription dangerouslySetInnerHTML={{ __html: children }}/>;
  }
  return <StyledEventDescription>{children}</StyledEventDescription>;
}

juiEventDescriptionComponent.displayName = 'JuiEventDescription';

const JuiEventDescription = withHighlight(['description'])(
  memo(juiEventDescriptionComponent),
);

export { JuiEventDescription };
