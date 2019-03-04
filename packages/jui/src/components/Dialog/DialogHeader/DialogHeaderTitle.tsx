/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 13:31:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import MuiDialogTitle, {
  DialogTitleProps as MuiDialogTitleProps,
} from '@material-ui/core/DialogTitle';
import {
  typography,
  ellipsis,
  palette,
} from '../../../foundation/utils/styles';

type JuiDialogHeaderTitleProps = MuiDialogTitleProps & {
  variant?: 'regular' | 'responsive';
};

const WrappedDialogTitle = ({
  variant,
  ...rest
}: JuiDialogHeaderTitleProps) => <MuiDialogTitle {...rest} />;
const JuiDialogHeaderTitle = styled<JuiDialogHeaderTitleProps>(
  WrappedDialogTitle,
)`
  && {
    padding: 0;
    flex: 1;
    min-width: 0;
    h2 {
      color: ${palette('grey', '900')};
      text-align: ${({ variant }) =>
        variant === 'responsive' ? 'center' : 'left'};
      ${ellipsis()}
      ${({ variant }) =>
        variant === 'responsive'
          ? typography('subheading1')
          : typography('title2')};
    }
  }
`;

export { JuiDialogHeaderTitle, JuiDialogHeaderTitleProps };
