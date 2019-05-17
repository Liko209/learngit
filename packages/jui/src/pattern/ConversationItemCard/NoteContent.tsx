/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 18:32:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import { typography, grey } from '../../foundation/utils/styles';
import { withHighlight } from '../../hoc/withHighlight';

type Props = {
  children?: string;
};

const StyledText = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;

function juiNoteContentComponent({ children = '' }: Props) {
  if (typeof children === 'string') {
    return <StyledText dangerouslySetInnerHTML={{ __html: children }}/>;
  }
  return <StyledText>{children}</StyledText>;
}
juiNoteContentComponent.displayName = 'JuiNoteContent';

const JuiNoteContent = withHighlight(['children'])(
  memo(juiNoteContentComponent),
);

export { JuiNoteContent };
