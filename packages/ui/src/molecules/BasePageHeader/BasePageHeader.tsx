import React from 'react';
import styled from 'styled-components';
import MuiToolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import MuiAppBar, { AppBarProps } from '@material-ui/core/AppBar';
import { WithTheme } from '@material-ui/core';

export type BasePageHeaderProps = {} & ToolbarProps &
  AppBarProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const StyledPageHeader = styled<BasePageHeaderProps>(MuiAppBar).attrs({})`
  && {
    min-height: 56px;
    padding-left: 0;
    padding-right: 0;

    > div {
      min-height: 56px;
    }
  }
`;

export const PageHeader: React.SFC<BasePageHeaderProps> = (
  props: BasePageHeaderProps,
) => {
  const { children, position, elevation, innerRef, ...rest } = props;
  return (
    <StyledPageHeader
      position={position || 'static'}
      elevation={elevation || 0}
      square={true}
      {...rest}
    >
      <MuiToolbar variant="dense">
        {children}
      </MuiToolbar>
    </StyledPageHeader>
  );
};

export default PageHeader;
