/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-07 16:38:09
 * Copyright © RingCentral. All rights reserved.
 */

import tinycolor from 'tinycolor2';
import styled, { css } from '../../../foundation/styled-components';
import {
  width,
  palette,
  spacing,
  typography,
  primary,
  grey,
  ellipsis,
} from '../../../foundation/utils/styles';

type PropsFormValue = {
  emphasize?: boolean;
};

const JuiProfileDialogContentForm = styled('div')`
  display: flex;
  padding: ${spacing(2, 0)};
  &:hover {
    background-color: ${grey('500')};
  }
`;

const JuiProfileDialogContentFormLeft = styled('div')`
  width: ${width(15)};
  flex-shrink: 0;
  color: ${palette('accent', 'ash')};
  padding: ${spacing(2, 4, 0, 6)};
`;

const JuiProfileDialogContentFormRight = styled('div')`
  flex: 1;
`;

const JuiProfileDialogContentFormLabel = styled('div')`
  ${typography('caption1')}
  ${ellipsis()};
  color: ${grey('500')};
`;

const JuiProfileDialogContentFormValue = styled<PropsFormValue, 'div'>('div')`
  ${typography('body2')};
  ${ellipsis()};
  margin-top: ${spacing(1)};
  color: ${({ emphasize }: PropsFormValue) =>
    emphasize ? primary('700') : grey('900')};
`;

export {
  JuiProfileDialogContentForm,
  JuiProfileDialogContentFormLeft,
  JuiProfileDialogContentFormRight,
  JuiProfileDialogContentFormLabel,
  JuiProfileDialogContentFormValue,
};
