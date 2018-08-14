import React from 'react';
import styled from 'styled-components';
import { WithTheme, Collapse, List } from '@material-ui/core';
import { CollapseProps } from '@material-ui/core/Collapse';

export type NestedListProps = {
  listTag?: string;
} & CollapseProps &
  Partial<Pick<WithTheme, 'theme'>>;

export const CustomNestedList: React.SFC<NestedListProps> = (
  props: NestedListProps,
) => {
  const { children, component, listTag, in: inProp, timeout, classes, ...rest } = props;
  return (
    <Collapse
      in={inProp}
      timeout={timeout}
      component={component}
      classes={classes}
    >
      <List component={listTag} {...rest} disablePadding={true}>
        {children}
      </List>
    </Collapse>
  );
};

export const NestedList = styled<NestedListProps>(CustomNestedList).attrs({})`
  && {
    background-color: white;
  }
`;

export default NestedList;
