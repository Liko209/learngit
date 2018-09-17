/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-17 13:24:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import styled from 'styled-components';
import MuiList, { ListProps } from '@material-ui/core/List';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import MuiListItemSecondaryAction, {
  ListItemSecondaryActionProps,
} from '@material-ui/core/ListItemSecondaryAction';
import MuiListItemText, {
  ListItemTextProps,
} from '@material-ui/core/ListItemText';

import JuiToggleButton from '../ToggleButton';
import { spacing, grey, typography } from '../../utils/styles';

const List = styled(MuiList)`
  && {
    padding: 0;
    margin: ${({ theme }) => spacing(3)} 0 ${({ theme }) => spacing(5)};
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
  }
`;

const ListItemText = styled(MuiListItemText)`
  && {
    color: ${grey('900')};
    ${typography('body1')};
  }
`;

interface IListToggleItemProps {
  text: string;
  checked: boolean;
}

type IProps = {
  items: IListToggleItemProps[];
  toggleChange(item: IListToggleItemProps, checked: boolean): void;
  ListProps?: ListProps;
  ListItemProps?: ListItemProps;
  ListItemSecondaryActionProps?: ListItemSecondaryActionProps;
  ListItemTextProps?: ListItemTextProps;
};

export { IListToggleItemProps };

export default class JuiListToggleButton extends Component<IProps, {}> {
  handleChange(
    item: IListToggleItemProps,
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) {
    this.props.toggleChange(item, checked);
  }

  render() {
    const { items } = this.props;

    return (
      <List dense={true}>
        {items.map(toggleItem => (
          <ListItem dense={true}>
            <ListItemText>{toggleItem.text}</ListItemText>
            <ListItemSecondaryAction>
              <JuiToggleButton
                checked={toggleItem.checked}
                onChange={this.handleChange.bind(this, toggleItem)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }
}
