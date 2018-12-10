/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-07 16:38:09
 * Copyright © RingCentral. All rights reserved.
 */

import styled from '../../../foundation/styled-components';
import {
  width,
  palette,
  spacing,
  typography,
  primary,
  grey,
  ellipsis,
  height,
} from '../../../foundation/utils/styles';
import { JuiGrid } from '../../../foundation/Layout/Grid';

type PropsFormValue = {
  emphasize?: boolean;
};

const JuiProfileDialogContentGrid = styled(JuiGrid)``;

const JuiProfileDialogContentFormCopy = styled('div')`
  color: ${grey('500')};
  position: absolute;
  right: ${width(3)};
  top: ${width(3)};
  cursor: pointer;
`;

const JuiProfileDialogContentForm = styled('div')`
  padding: ${spacing(4, 0)};
  &:last-child {
    padding-bottom: 0;
  }
  ${JuiProfileDialogContentGrid}> ${JuiProfileDialogContentGrid}:first-child {
    border-right: 1px solid ${grey('300')};
  }
`;

const JuiProfileDialogContentFormGroup = styled('div')`
  display: flex;
  padding: ${spacing(2, 0)};
  height: ${height(14)};
  box-sizing: border-box;
  position: relative;
  &:hover {
    background-color: ${grey('100')};
    ${JuiProfileDialogContentFormCopy} {
      display: block;
    }
  }
  ${JuiProfileDialogContentFormCopy} {
    display: none;
  }
`;

const JuiProfileDialogContentFormLeft = styled('div')`
  width: ${width(15)};
  box-sizing: border-box;
  flex-shrink: 0;
  color: ${palette('accent', 'ash')};
  padding: ${spacing(0, 4, 0, 6)};
`;

const JuiProfileDialogContentFormRight = styled('div')`
  flex: 1;
  overflow: hidden;
`;

const JuiProfileDialogContentFormLabel = styled('div')`
  ${typography('caption1')}
  ${ellipsis()};
  padding-right: ${spacing(2)};
  color: ${grey('500')};
`;

const JuiProfileDialogContentFormValue = styled<PropsFormValue, 'div'>('div')`
  ${typography('body2')};
  ${ellipsis()};
  padding-right: ${spacing(2)};
  color: ${({ emphasize }: PropsFormValue) =>
    emphasize ? primary('700') : grey('900')};
`;

export {
  JuiProfileDialogContentGrid,
  JuiProfileDialogContentForm,
  JuiProfileDialogContentFormGroup,
  JuiProfileDialogContentFormLeft,
  JuiProfileDialogContentFormRight,
  JuiProfileDialogContentFormLabel,
  JuiProfileDialogContentFormValue,
  JuiProfileDialogContentFormCopy,
};
