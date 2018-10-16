/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:46:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiSnackbarContent, {
  SnackbarContentProps,
} from '@material-ui/core/SnackbarContent';

import styled from '../../foundation/styled-components';
import { spacing, palette, grey } from '../../foundation/utils/styles';
import { JuiIconography } from '../../foundation/Iconography';

type JuiSnackbarContentProps = {
  bgColor: string[];
} & SnackbarContentProps;

type JuiSnackbarIcon = {
  color: string[];
};

const WrapperSnackbarIcon = ({ color, ...rest }: JuiSnackbarIcon) => (
  <JuiIconography {...rest} />
);

const SnackbarIcon = styled<JuiSnackbarIcon>(WrapperSnackbarIcon)`
  margin: ${spacing(0, 2, 0, 0)};
  color: ${(props: any) => palette(props.color[0], props.color[1])};
`;

const WrapperContent = ({ bgColor, ...rest }: JuiSnackbarContentProps) => (
  <MuiSnackbarContent {...rest} />
);

const SnackbarContent = styled<JuiSnackbarContentProps>(WrapperContent)`
  && {
    padding: ${spacing(2, 6)};
    color: ${grey('900')};
    background: ${(props: any) =>
      palette(props.bgColor[0], props.bgColor[1], 1)};
    box-shadow: none;
  }
  .message {
    padding: 0;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export { SnackbarContent, MessageWrapper, SnackbarIcon };
