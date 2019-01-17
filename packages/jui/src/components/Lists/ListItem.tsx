/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiListItemProps = MuiListItemProps & {
  singleLine?: boolean;
};

const WrappedListItem = ({ singleLine, ...rests }: JuiListItemProps) => (
  <MuiListItem {...rests} />
);

const StyledListItem = styled<JuiListItemProps>(WrappedListItem)`
  && {
    padding: ${spacing(2)};
    padding-left: ${props => (props.singleLine ? spacing(4) : spacing(2))};
  }
`;

const JuiListItem = (props: JuiListItemProps) => {
  return (
    <StyledListItem button={true} {...props}>
      {props.children}
    </StyledListItem>
  );
};

JuiListItem.defaultProps = {
  singleLine: false,
};
JuiListItem.displayName = 'JuiListItem';

export { JuiListItem, JuiListItemProps };
