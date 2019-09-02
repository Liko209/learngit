/*
 * @Author: Spike.Yang
 * @Date: 2019-08-26 16:52:42
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils/styles';
import { JuiButton } from '../../../components/Buttons';

const JuiAudioConferenceJoin = styled(JuiButton)`
  && {
    margin-top: ${spacing(2)};
  }
`;

JuiAudioConferenceJoin.displayName = 'JuiAudioConferenceJoin';

export { JuiAudioConferenceJoin };
