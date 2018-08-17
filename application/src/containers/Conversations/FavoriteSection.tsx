/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-16 13:41:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  ConversationList as List,
  ConversationListItem as ListItem,
  ConversationListSection,
  Icon,
} from 'ui-components';
import FavoriteListPresenter from './FavoriteListPresenter';
interface IProps {

}

interface IState {
  groups: Group[];
}

interface Group {
  id: number;
  display_name: string;
  is_team: boolean;
  members: number[];
}

class FavoriteSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.favoritePresenter = new FavoriteListPresenter();
    this.state = {
      groups: [{
        id: 1,
        display_name: 'group1',
        members: [1, 2, 3],
        is_team: false,
      }, {
        id: 2,
        display_name: 'team2',
        members: [1, 2, 3, 4],
        is_team: true,
      }],
    };
  }

  renderFavoriteGroups() {
    return (
      <List value={0}>
        {this.state.groups.map((item: Group) => {
          return (
            <ListItem
              key={item.id}
              status="online"
              title={item.display_name}
              unreadCount={10}
              showCount={!item.is_team}
            />);
        })}
      </List>
    );
  }

  render() {

    return (
      <div>
        <ConversationListSection
          icon={<Icon>S</Icon>}
          title={'Favorite'}
          unreadCount={12}
          important={true}
          showCount={true}
          expanded={true}
        />
        {this.renderFavoriteGroups()}
      </div >
    );
  }
}

export default FavoriteSection;
