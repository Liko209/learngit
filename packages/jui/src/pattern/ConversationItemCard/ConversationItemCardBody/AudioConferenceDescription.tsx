/*
 * @Author: ken.li
 * @Date: 2019-05-14 15:44:38
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../foundation/styled-components';
import { typography, primary } from '../../../foundation/utils/styles';

const JuiAudioConferenceDescription = styled.span`
  && a {
    ${typography('caption1')};
    color: ${primary('700')};
  }
`;

JuiAudioConferenceDescription.displayName = 'JuiAudioConferenceDescription';

export { JuiAudioConferenceDescription };
