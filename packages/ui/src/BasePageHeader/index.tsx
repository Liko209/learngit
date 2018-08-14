import React from 'react';
import styled from 'styled-components';
import MuiToolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import MuiAppBar, { AppBarProps } from '@material-ui/core/AppBar';
import { WithTheme } from '@material-ui/core';

export type BasePageHeaderProps = {} & ToolbarProps &
  AppBarProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const CustomPageHeader: React.SFC<BasePageHeaderProps> = (
  props: BasePageHeaderProps,
) => {
  const { children, position, elevation, ...rest } = props;
  return (
    <MuiAppBar
      position={position || 'static'}
      elevation={elevation || 0}
      square={true}
      {...rest}
    >
      <MuiToolbar variant="dense">
        {children}
      </MuiToolbar>
    </MuiAppBar>
  );
};

export const PageHeader = styled<BasePageHeaderProps>(CustomPageHeader).attrs({})`
  && {
    min-height: 56px;
    padding-left: 0;
    padding-right: 0;

    > div {
      min-height: 56px;
    }
  }
`;

export default PageHeader;
