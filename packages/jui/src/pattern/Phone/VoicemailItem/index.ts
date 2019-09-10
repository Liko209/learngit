/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 15:58:11
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../../foundation/styled-components';
import { JuiTypography } from '../../../foundation/Typography';
import { typography, grey } from '../../../foundation/utils';
import {
  JuiExpansionPanel,
  JuiExpansionPanelDetails,
} from 'rcui/components/ExpansionPanel';

const StyleVoicemailItem = JuiExpansionPanel;

const StyledVoicemailDetail = JuiExpansionPanelDetails;

const StyledTime = styled(JuiTypography)`
  && {
    ${typography('caption1')};
    color: ${grey('600')};
    white-space: nowrap;
    text-align: right;
    max-width: 35%;
    width: 35%;
  }
`;

const StyledAudioPlayerWrapper = styled.div`
  max-width: 25%;
  width: 25%;
  flex: 1;
`;

const StyledContactWrapper = styled.div`
  max-width: 40%;
  width: 40%;
  flex: 1;
`;
const StyledActionWrapper = styled.div`
  max-width: 35%;
  width: 35%;
  display: flex;
  justify-content: flex-end;
`;

export * from './VoicemailSummary';
export * from './Actions';
export * from './ActionButton';
export {
  StyledTime,
  StyleVoicemailItem,
  StyledVoicemailDetail,
  StyledAudioPlayerWrapper,
  StyledContactWrapper,
  StyledActionWrapper,
};
