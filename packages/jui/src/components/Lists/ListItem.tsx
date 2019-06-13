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
import { spacing, width } from '../../foundation/utils';

type JuiListItemProps = MuiListItemProps & {
  width?: number;
  isInline?: boolean;
  singleLine?: boolean;
  disableButton?: boolean;
};

const WrappedListItem = React.memo(
  ({ width, isInline, singleLine, disableButton, ...rests }: JuiListItemProps) => (
    <MuiListItem {...rests} />
  ),
);

const StyledListItem = styled<JuiListItemProps>(WrappedListItem)`
  && {
    padding: ${spacing(2)};
    width: ${props => (props.width ? width(props.width) : '100%')};
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    padding-left: ${props => (props.singleLine ? spacing(4) : spacing(2))};
  }
`;

const JuiListItemComponent = (props: JuiListItemProps) => {
  return (
    <StyledListItem button={!props.disableButton && true} {...props}>
      {props.children}
    </StyledListItem>
  );
};

JuiListItemComponent.defaultProps = {
  singleLine: false,
};
JuiListItemComponent.displayName = 'JuiListItem';

const JuiListItem = React.memo(JuiListItemComponent);

export { JuiListItem, JuiListItemProps };
