import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { WithTheme } from '@material-ui/core';

export type TIconButtonProps = {} & IconButtonProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const CustomIconButton: React.SFC<TIconButtonProps> = (
  props: TIconButtonProps,
) => {
  return <MuiIconButton {...props} />;
};

export const IconButton = styled<TIconButtonProps>(CustomIconButton).attrs(
  {},
)``;

export default IconButton;
