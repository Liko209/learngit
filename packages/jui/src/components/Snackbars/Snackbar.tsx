/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-12-06 15:53:10
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import {
  default as MuiSnackbar,
  SnackbarProps as MuiSnackbarProps,
} from '@material-ui/core/Snackbar';
import styled from '../../foundation/styled-components';

type JuiSnackbarProps = MuiSnackbarProps & {
  noFix?: boolean;
};

const WrappedMuiSnackbar = React.memo((props: JuiSnackbarProps) => {
  const { noFix, ...rest } = props;
  return <MuiSnackbar className="snackbar" {...rest} />;
});

const JuiSnackbar = styled<JuiSnackbarProps>(WrappedMuiSnackbar)`
  && {
    position: ${({ noFix }) => (noFix ? 'relative' : 'fixed')};
    display: ${({ noFix }) => (noFix ? 'block' : 'flex')};
  }
`;

export { JuiSnackbar, JuiSnackbarProps };
