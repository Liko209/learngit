/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 18:32:33
 * Copyright © RingCentral. All rights reserved.
 */
import styled from '../../foundation/styled-components';
import { JuiDialogHeaderTitle } from '../../components/Dialog/DialogHeader';
import { typography, grey, spacing } from '../../foundation/utils/styles';

const JuiNoteContent = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;

const JuiNoteTitle = styled(JuiDialogHeaderTitle)`
  && {
    h2 {
      text-align: 'center';
    }
  }
`;

const JuiNoteIframe = styled.iframe`
  padding: ${spacing(10)} ${spacing(20)};
  width: ${spacing(160)};
  border: 0;
  height: 100%;
  box-shadow: rgba(0, 0, 0, 0.15) 0 0 10px;
  min-height: ${spacing(125)};
  margin: ${spacing(4)} auto 0;
  word-wrap: break-word;
`;

export { JuiNoteContent, JuiNoteIframe, JuiNoteTitle };
