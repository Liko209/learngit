/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-02-28 10:04:08
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';
import { withHighlight } from '../../../hoc/withHighlight';

type Props = {
  text: string;
};

const StyledTaskSectionOrDescription = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;

const JuiTaskSectionOrDescriptionComponent = ({ text }: Props) => (
  <StyledTaskSectionOrDescription dangerouslySetInnerHTML={{ __html: text }} />
);

JuiTaskSectionOrDescriptionComponent.displayName =
  'JuiTaskSectionOrDescription';

const JuiTaskSectionOrDescription = withHighlight(['text'])(
  memo(JuiTaskSectionOrDescriptionComponent),
);

export { JuiTaskSectionOrDescription };
