import React from 'react';
import styled from 'styled-components';
import MuiToolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import MuiAppBar, { AppBarProps } from '@material-ui/core/AppBar';
import { WithTheme } from '@material-ui/core';

export type PageHeaderProps = {} & ToolbarProps &
  AppBarProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const CustomPageHeader: React.SFC<PageHeaderProps> = (
  props: PageHeaderProps,
) => {
  const { children, variant, position, elevation, ...rest } = props;
  return (
    <MuiAppBar
      position={position || 'static'}
      elevation={elevation || 0}
      square={false}
      {...rest}
    >
      <MuiToolbar variant="dense">{children}</MuiToolbar>
    </MuiAppBar>
  );
};

export const PageHeader = styled<PageHeaderProps>(CustomPageHeader).attrs({})`
  && {
    background-color: white;
    border-radius: 2px;
    min-height: 56px;
    padding-left: 0;
    padding-right: 0;

    > div {
      min-height: 56px;
      padding-left: 16px;
      padding-right: 24px;
    }
  }
`;

export default PageHeader;
