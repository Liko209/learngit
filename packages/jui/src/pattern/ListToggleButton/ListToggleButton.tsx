/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 13:24:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import MuiList, { ListProps } from '@material-ui/core/List';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import MuiListItemSecondaryAction, {
  ListItemSecondaryActionProps,
} from '@material-ui/core/ListItemSecondaryAction';
import MuiListItemText, {
  ListItemTextProps,
} from '@material-ui/core/ListItemText';

import { JuiToggleButton } from '../../components/Buttons/ToggleButton';
import { spacing, grey, typography } from '../../foundation/utils/styles';

const List = styled(MuiList)`
  && {
    padding: 0;
    margin: ${({ theme }) => spacing(5)} 0;
  }
`;

const ListItem = styled(MuiListItem)`
  && {
    padding: 0;
    margin: 0 0 ${({ theme }) => spacing(4)} 0;
  }
`;

const ListItemSecondaryAction = styled(MuiListItemSecondaryAction)`
  && {
    right: 0;
    transform: translate3d(0, -50%, 0);
  }
`;

const ListItemText = styled(MuiListItemText)`
  && {
    color: ${grey('900')};
    ${typography('body1')};
  }
`;

type JuiListToggleItemProps = {
  text: string;
  checked: boolean;
  disabled?: boolean;
  automationId: string;
  [propName: string]: any;
};

type Props = {
  items: JuiListToggleItemProps[];
  onChange(item: JuiListToggleItemProps, checked: boolean): void;
  listProps?: ListProps;
  listItemProps?: ListItemProps;
  listItemSecondaryActionProps?: ListItemSecondaryActionProps;
  listItemTextProps?: ListItemTextProps;
};

class JuiListToggleButton extends PureComponent<Props, {}> {
  handleChange(
    item: JuiListToggleItemProps,
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) {
    this.props.onChange(item, checked);
  }

  render() {
    const { items, onChange, listProps, listItemProps, ...rest } = this.props;

    return (
      <List dense={true} {...listProps} {...rest}>
        {items.map(toggleItem => (
          <ListItem
            data-test-automation-id={toggleItem.automationId}
            {...listItemProps}
            key={toggleItem.text}
            dense={true}
          >
            <ListItemText>{toggleItem.text}</ListItemText>
            <ListItemSecondaryAction>
              <JuiToggleButton
                checked={toggleItem.checked}
                disabled={!!toggleItem.disabled}
                onChange={this.handleChange.bind(this, toggleItem)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }
}

export { JuiListToggleButton, JuiListToggleItemProps };
