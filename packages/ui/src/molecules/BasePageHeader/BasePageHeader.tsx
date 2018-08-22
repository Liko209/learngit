import React from 'react';
import styled from '../../styled-components';
import MuiToolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import MuiAppBar, { AppBarProps } from '@material-ui/core/AppBar';

export type BasePageHeaderProps = {} & ToolbarProps &
  AppBarProps;

export const StyledPageHeader = styled<BasePageHeaderProps>(MuiAppBar)`
  && {
    min-height: ${({ theme }) => theme.spacing.unit * 14}px;
    padding-left: 0;
    padding-right: 0;

    > div {
      min-height: ${({ theme }) => theme.spacing.unit * 14}px;
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
