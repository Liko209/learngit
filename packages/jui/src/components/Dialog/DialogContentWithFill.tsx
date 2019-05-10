/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-11 11:01:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import MuiDialogContent, {
  DialogContentProps as MuiDialogContentProps,
} from '@material-ui/core/DialogContent';
import styled, { css } from '../../foundation/styled-components';
import { height } from '../../foundation/utils/styles';

type JuiDialogContentWithFillProps = MuiDialogContentProps & {
  noPaddingFix?: boolean;
};

const StyledDialogContent = styled(MuiDialogContent)<
  JuiDialogContentWithFillProps
>`
  && {
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  ${({ noPaddingFix }) =>
    noPaddingFix
      ? null
      : css`
          &:after {
            content: '';
            height: ${height(6)};
            display: block;
            flex-shrink: 0;
          }
        `};
`;

const JuiDialogContentWithFill = memo(
  ({ noPaddingFix, ...rest }: JuiDialogContentWithFillProps) => {
    return <StyledDialogContent {...rest} />;
  },
);

export { JuiDialogContentWithFill, JuiDialogContentWithFillProps };
