import React from 'react';
import MuiCircularProgress, {
  CircularProgressProps as MuiCircularProgressProps,
} from '@material-ui/core/CircularProgress';
import styled from '../../foundation/styled-components';
type RuiCircularProgressProps = MuiCircularProgressProps;

const RuiCircularProgress = styled((props: RuiCircularProgressProps) => (
  <MuiCircularProgress {...props} />
))<RuiCircularProgressProps>``;

RuiCircularProgress.defaultProps = {
  size: 24,
};

RuiCircularProgress.displayName = 'RuiCircularProgress';

export { RuiCircularProgress, RuiCircularProgressProps };
