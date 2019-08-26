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

// type issue, so add button, https://github.com/mui-org/material-ui/issues/14971
type MuiListItemPropsFixed = MuiListItemProps & {
  button?: any;
};

type JuiListItemProps = MuiListItemPropsFixed & {
  width?: number;
  isInline?: boolean;
  singleLine?: boolean;
  disableButton?: boolean;
};

const StyledListItem = styled<JuiListItemProps>(MuiListItem)`
  && {
    padding: ${spacing(2)};
    width: ${props => (props.width ? width(props.width) : '100%')};
    display: flex;
    cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  }

  &&.inline {
    display: inline-flex;
  }

  &&.single-line {
    padding-left: ${spacing(4)};
  }
`;

const JuiListItem = ({ className, singleLine, isInline, disableButton, children, ...rest }: JuiListItemProps) => {
  const classes = [className]
  if(singleLine) {
    classes.push('single-line')
  }
  if(isInline){
    classes.push('single-line')
  }
  return (
    <StyledListItem className={classes.join(' ')} button={!disableButton} {...rest}>
      {children}
    </StyledListItem>
  )
};

JuiListItem.defaultProps = {
  singleLine: false,
};
JuiListItem.displayName = 'JuiListItem';

export { JuiListItem, JuiListItemProps };
