/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-08-16 13:41:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import {
  ConversationList as List,
  ConversationListSection,
  Icon,
} from 'ui-components';
import FavoriteListPresenter from './FavoriteListPresenter';
import ConversationListItemCell from './ConversationListItemCell';
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
  favoritePresenter: FavoriteListPresenter;
  constructor(props: IProps) {
    super(props);
    this.favoritePresenter = new FavoriteListPresenter();
  }

  renderFavoriteGroups() {
    const store = this.favoritePresenter.getStore();
    let ids = store.getIds();
    if (!ids.length) {
      ids = [123];
    }
    return (
      <List value={0}>
        {ids.map(id => (<ConversationListItemCell id={id} key={id} />))}
      </List>
    );
  }

  render() {
    return (
      <div>
        <ConversationListSection
          icon={<Icon>S</Icon>}
          title={'Favorites'}
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
