/*
 * @Author: ken.li
 * @Date: 2019-05-14 15:44:38
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, primary } from '../../../foundation/utils/styles';

type Props = {
  children?: string;
};

const StyledAudioConferenceDescription = styled.span`
  && a {
    ${typography('caption1')};
    color: ${primary('700')};
  }
`;

const JuiAudioConferenceDescription = memo((props: Props) => (
  <StyledAudioConferenceDescription>
    {props.children}
  </StyledAudioConferenceDescription>
));

JuiAudioConferenceDescription.displayName = 'JuiAudioConferenceDescription';

export { JuiAudioConferenceDescription };
