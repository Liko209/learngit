import React from 'react';
import styled from 'styled-components';
import { WithTheme, ListItem, Icon, ListItemText, ListItemIcon } from '@material-ui/core';
import { ListItemProps } from '@material-ui/core/ListItem';

export type NestedListProps = {
  iconName?: string,
  text: string,
} & ListItemProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const CustomNestedList: React.SFC<NestedListProps> = (props: NestedListProps) => {
  const { children, iconName, text, ...rest } = props;
  const icon = (
    <ListItemIcon>
      <Icon>{iconName}</Icon>
    </ListItemIcon>
  );
  return (
    <ListItem button={true} {...rest}>
      {iconName ? icon : null}
      <ListItemText inset={true} primary={text} />
      {children}
    </ListItem>
  );
};

export const NestedList = styled<NestedListProps>(CustomNestedList).attrs({})`
  && {
    background-color: #f9f9f9;
    border-bottom: 1px solid #ddd;
  }
`;

export default NestedList;
